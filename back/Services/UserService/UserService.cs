using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Models;
using Microsoft.EntityFrameworkCore.Metadata;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Dtos.User;
using back.Dtos.Chat;
using back.Dtos.Message;

namespace back.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly ApplicationDBContext _context;

        public UserService(ApplicationDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<ServiceResponse<GetUserDto>> GetUser(int id)
        {
            var user = await _context.Users
                                     .Include(u => u.UserChats)
                                     .ThenInclude(uc => uc.Chat)
                                     .ThenInclude(c => c.Messages)
                                     .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return new ServiceResponse<GetUserDto>
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            var userDto = new GetUserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Chats = user.UserChats.Select(uc => new GetChatDto
                {
                    Id = uc.Chat.Id,
                    Name = uc.Chat.Name,
                    RecentMessages = uc.Chat.getLast30Messages(uc.Chat.Messages.OrderByDescending(m => m.Id).FirstOrDefault()?.Id + 1 ?? int.MaxValue)
                                            .Select(message => new GetMessageDto
                                            {
                                                Id = message.Id,
                                                Content = message.Content,
                                                Date = message.Date,
                                                ChatId = message.ChatId,
                                                UserId = message.UserId
                                            })
                                            .ToList()
                }).ToList()
            };

            var response = new ServiceResponse<GetUserDto>
            {
                Data = userDto
            };

            return response;
        }
        public async Task<ServiceResponse<GetUserDto>> AddUser(AddUserDto newUser)
        {
            var user = _mapper.Map<User>(newUser);
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            var response = new ServiceResponse<GetUserDto>
            {
                Data = _mapper.Map<GetUserDto>(user)
            };
            return response;
        }
    }
}