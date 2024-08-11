using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Dtos.Chat;
using back.Dtos.Message;
using back.Models;

namespace back.Services.MessageService
{
    public interface IMessageService
    {
        public Task<ServiceResponse<GetChatDto>> GetMessage(int id, int chatId, int userId);
        public Task<ServiceResponse<GetChatDto>> AddMessage(AddMessageDto newMessage);
    }
}