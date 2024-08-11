using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using back.Data;
using back.Dtos.Chat;
using back.Dtos.User;
using back.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Dtos.Message;
using Microsoft.AspNetCore.SignalR;
using back.SignalR;

namespace back.Services.ChatService
{
    public class ChatService : ControllerBase, IChatService
    {
        private readonly ApplicationDBContext _context;
        private readonly IMapper _mapper;
        private readonly IHubContext<ChatHub> _hubContext;
        public ChatService(ApplicationDBContext context, IMapper mapper, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _mapper = mapper;
            _hubContext = hubContext;
        }
        public async Task<ActionResult<ServiceResponse<GetChatDto>>> MatchUsers(int userId)
        {
            Console.WriteLine("User id: " + userId);
            User? user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return BadRequest(new ServiceResponse<GetUserDto>
                {
                    Success = false,
                    Message = "User not found"
                });
            }
            string chName = user.Name;

            var chatWithOneUser = await _context.Chats
                .Where(c => c.UserChats.Count == 1)
                .Include(c => c.UserChats)
                .ThenInclude(uc => uc.User)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync();

            Console.WriteLine("Chat with one user: " + chatWithOneUser?.Name);
            Console.WriteLine("Chat with one user id: " + chatWithOneUser?.Id);
            Console.WriteLine("Chat with one user userchats count: " + chatWithOneUser?.UserChats.Count);
            Console.WriteLine("Chat with one user messages count: " + chatWithOneUser?.Messages.Count);

            if (chatWithOneUser != null)
            {
                Console.WriteLine("Found chat with one user");
            }

            if (chatWithOneUser != null)
            {
                Console.WriteLine("Found chat with one user");
                Chat ch = chatWithOneUser;
                bool userChatExists = await _context.UserChats
                    .AnyAsync(uc => uc.UserId == user.Id && uc.ChatId == ch.Id);
                Console.WriteLine("User chat exists: " + userChatExists);
                if (userChatExists)
                {
                    return BadRequest(new ServiceResponse<GetChatDto>
                    {
                        Success = false,
                        Message = "Chat already exists"
                    });
                }

                Console.WriteLine("Logging all UserChats:");
                Console.WriteLine("Count: " + ch.UserChats.Count);
                foreach (var uc in ch.UserChats)
                {
                    Console.WriteLine($"UserChat - UserId: {uc.UserId}, UserName: {uc.User?.Name}");
                }

                User? otherUser = ch.UserChats
                    .Where(uc => uc.UserId != user.Id)
                    .Select(uc => uc.User)
                    .FirstOrDefault();

                Console.WriteLine("Other user: " + otherUser?.Name);
                Console.WriteLine("User id: " + user.Id);
                Console.WriteLine("Other user id: " + otherUser?.Id);

                chName = chName + " & " + otherUser?.Name;
                ch.Name = chName;
                _context.SaveChanges();
                if (!userChatExists)
                {
                    UserChat uc = new UserChat
                    {
                        UserId = user.Id,
                        User = user,
                        ChatId = ch.Id,
                        Chat = ch
                    };
                    user.UserChats.Add(uc);
                    ch.UserChats.Add(uc);
                    Console.WriteLine("Added user chat");
                    Console.WriteLine("UserId: " + uc.UserId);
                    Console.WriteLine("ChatId: " + uc.ChatId);
                    await _context.SaveChangesAsync();
                }

                var lastmsg = ch.Messages.LastOrDefault();
                Console.WriteLine("Last message id: " + lastmsg?.Id);
                var chmsgs = ch.getLast30Messages(lastmsg?.Id + 1 ?? 0);
                Console.WriteLine("Chat messages count: " + chmsgs.Count());
                var chmsgdtos = chmsgs.Select(m => new GetMessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    Date = m.Date,
                    ChatId = m.ChatId,
                    UserId = m.UserId
                }).ToList();
                try
                {
                    await _hubContext.Clients.Group("2147483647")
                        .SendAsync("ReceiveMessage", "2147483647", null);
                    Console.WriteLine("Message sent successfully to group " + "2147483647");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error sending message to group 2147483647: " + ex.Message);
                }
                return Ok(new ServiceResponse<GetChatDto>
                {
                    Success = true,
                    Data = new GetChatDto
                    {
                        Id = ch.Id,
                        Name = chName,
                        RecentMessages = chmsgdtos
                    }
                });
            }

            Chat newChat = new Chat();
            newChat.Name = user.Name;
            var lastChat = await _context.Chats
                .OrderBy(c => c.Id)
                .LastOrDefaultAsync();
            if (lastChat != null)
            {
                Console.WriteLine("Last chat id: " + lastChat.Id);
                newChat.Id = lastChat.Id + 1;
            }
            else
            {
                Console.WriteLine("No chats found");
                newChat.Id = 1;
            }
            UserChat ucc = new UserChat
            {
                UserId = user.Id,
                User = user,
                ChatId = newChat.Id,
                Chat = newChat
            };
            Console.WriteLine("User id: " + ucc.UserId);
            Console.WriteLine("Chat id: " + ucc.ChatId);
            user.UserChats.Add(ucc);
            newChat.UserChats.Add(ucc);
            _context.Chats.Add(newChat);
            _context.SaveChanges();
            var lastMessage = chatWithOneUser?.Messages.LastOrDefault();
            Console.WriteLine("Last message id: " + lastMessage?.Id);
            Console.WriteLine("Last message content: " + lastMessage?.Content);
            var chMessages = chatWithOneUser?.getLast30Messages(lastMessage?.Id + 1 ?? 0);
            var chMessageDtos = chMessages?.Select(m => new GetMessageDto
            {
                Id = m.Id,
                Content = m.Content,
                Date = m.Date,
                ChatId = m.ChatId,
                UserId = m.UserId
            }).ToList();
            Console.WriteLine("Chat with one user messages count: " + chMessages?.Count());
            GetChatDto newChatDto = new GetChatDto
            {
                Id = newChat.Id,
                Name = newChat.Name,
                RecentMessages = chMessageDtos ?? new List<GetMessageDto>()
            };

            return Ok(new ServiceResponse<GetChatDto>
            {
                Success = true,
                Data = newChatDto,
            });
        }

        public async Task<ActionResult<ServiceResponse<int>>> DeleteChat(int chatId)
        {
            // Find the chat
            Chat? chat = await _context.Chats.FirstOrDefaultAsync(c => c.Id == chatId);
            if (chat == null)
            {
                return BadRequest(new ServiceResponse<int>
                {
                    Success = false,
                    Message = "Chat not found"
                });
            }

            // Delete messages associated with the chat
            var messages = _context.Messages.Where(m => m.ChatId == chatId);
            _context.Messages.RemoveRange(messages);

            // Delete user-chat associations for the chat
            var userChats = _context.UserChats.Where(uc => uc.ChatId == chatId);
            _context.UserChats.RemoveRange(userChats);

            // Delete the chat itself
            _context.Chats.Remove(chat);

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new ServiceResponse<int>
            {
                Success = true,
                Data = chatId
            });
        }
    }
}