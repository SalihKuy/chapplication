using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using back.Services.MessageService;
using back.Dtos.Message;
using back.Models;
using back.Dtos.Chat;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
            private readonly IMessageService _messageService;
            public MessageController(IMessageService messageService)
            {
                _messageService = messageService;
            }
            [HttpGet]
            public async Task<ActionResult<ServiceResponse<GetChatDto>>> GetMessage(int id, int chatId, int userId)
            {
                Console.WriteLine("Getting message");
                return await _messageService.GetMessage(id, chatId, userId);
            }
            [HttpPost]
            public Task<ServiceResponse<GetChatDto>> AddMessage(AddMessageDto newMessage)
            {
                Console.WriteLine("Adding message");
                return _messageService.AddMessage(newMessage);
            }
    }
}