using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using back.Dtos.Chat;
using back.Models;

namespace back.Services.ChatService
{
    public interface IChatService
    {
        public Task<ActionResult<ServiceResponse<GetChatDto>>> MatchUsers(int userId);
        public Task<ActionResult<ServiceResponse<int>>> DeleteChat(int id);
    }
}