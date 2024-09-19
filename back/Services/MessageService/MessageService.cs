using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Dtos.Message;
using back.Models;
using back.Data;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using back.Dtos.Chat;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using back.SignalR;


namespace back.Services.MessageService
{
    public class MessageService : ControllerBase, IMessageService
    {
        private readonly IMapper _mapper;
        private readonly ApplicationDBContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public MessageService(ApplicationDBContext context, IMapper mapper, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _mapper = mapper;
            _hubContext = hubContext;
        }
        public async Task<ServiceResponse<GetChatDto>> GetMessage(int id, int chatId, int userId)
        {
            var serviceResponse = new ServiceResponse<GetChatDto>();

            Chat? ch = await _context.Chats
                                     .Include(c => c.Messages)
                                     .FirstOrDefaultAsync(c => c.Id == chatId);
            User? user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            Console.WriteLine("Chat name: " + ch?.Name);
            Console.WriteLine("Chat messages count: " + ch?.Messages.Count);
            Console.WriteLine("Chat userchats count: " + ch?.UserChats.Count);
            Console.WriteLine("Chat id: " + ch?.Id);
            if (ch == null)
            {
                serviceResponse.Success = false;
                serviceResponse.Message = "Chat not found";
                return serviceResponse;
            }
            if (user == null)
            {
                serviceResponse.Success = false;
                serviceResponse.Message = "User not found";
                return serviceResponse;
            }

            Console.WriteLine("Calling getLast30Messages");
            var messages = ch.getLast30Messages(id);
            Console.WriteLine("getLast30Messages called successfully");

            var chatDto = new GetChatDto
            {
                Id = ch.Id,
                Name = ch.Name,
                RecentMessages = messages.Select(m => new GetMessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    Date = m.Date,
                    ChatId = m.ChatId,
                    UserId = m.UserId
                }).ToList()
            };

            serviceResponse.Data = chatDto;
            return serviceResponse;
        }
        public async Task<ServiceResponse<GetChatDto>> AddMessage(AddMessageDto newMessage)
        {
            var serviceResponse = new ServiceResponse<GetChatDto>();
            Console.WriteLine("Content: " + newMessage.Content);
            Console.WriteLine("ChatId: " + newMessage.ChatId);
            Console.WriteLine("UserId: " + newMessage.UserId);

            Chat? ch = await _context.Chats
                                     .Include(c => c.Messages)
                                     .FirstOrDefaultAsync(c => c.Id == newMessage.ChatId);
            User? user = await _context.Users.FirstOrDefaultAsync(u => u.Id == newMessage.UserId);

            Console.WriteLine("Chat name: " + ch?.Name);
            Console.WriteLine("Chat messages count: " + ch?.Messages.Count);
            Console.WriteLine("Chat userchats count: " + ch?.UserChats.Count);
            Console.WriteLine("Chat id: " + ch?.Id);
            if (ch == null)
            {
                serviceResponse.Success = false;
                serviceResponse.Message = "Chat not found";
                return serviceResponse;
            }
            if (user == null)
            {
                serviceResponse.Success = false;
                serviceResponse.Message = "User not found";
                return serviceResponse;
            }
            var message = new Message
            {
                Content = newMessage.Content,
                Date = DateTime.UtcNow,
                ChatId = newMessage.ChatId,
                UserId = newMessage.UserId,
                User = user
            };
            Console.WriteLine("message userid: " + message.UserId);
            var msgs = await _context.Messages.ToListAsync();
            if (msgs.Count == 0)
            {
                message.Id = 1;
            }
            else
            {
                message.Id = msgs.OrderBy(m => m.Id).Last().Id + 1;
            }
            ch.Messages.Add(message);
            Console.WriteLine("UserId before SaveChanges: " + message.UserId);
            await _context.SaveChangesAsync();
            Console.WriteLine("UserId after SaveChanges: " + message.UserId);
            try
            {
                await _hubContext.Clients.Group(newMessage.ChatId.ToString())
                    .SendAsync("ReceiveMessage", newMessage.UserId, new GetMessageDto
                    {
                        Content = newMessage.Content,
                        Date = DateTime.UtcNow,
                        ChatId = newMessage.ChatId,
                        UserId = newMessage.UserId,
                        Id = message.Id
                    });
                Console.WriteLine("Message sent successfully to group " + newMessage.ChatId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending message to group " + newMessage.ChatId + ": " + ex.Message);
            }

            Console.WriteLine("message content: " + message.Content);
            Console.WriteLine("message date: " + message.Date);
            Console.WriteLine("message chatid: " + message.ChatId);
            Console.WriteLine("message userid: " + message.UserId);
            Console.WriteLine("message id: " + message.Id);
            Console.WriteLine("ch messages count: " + ch.Messages.Count);

            Console.WriteLine("Calling getLast30Messages");
            var messages = ch.getLast30Messages(message.Id + 1);
            Console.WriteLine("getLast30Messages called successfully");

            var chatDto = new GetChatDto
            {
                Id = ch.Id,
                Name = ch.Name,
                RecentMessages = messages.Select(m => new GetMessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    Date = m.Date,
                    ChatId = m.ChatId,
                    UserId = m.UserId
                }).ToList()
            };

            serviceResponse.Data = chatDto;
            return serviceResponse;
        }
    }
}