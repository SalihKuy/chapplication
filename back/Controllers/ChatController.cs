using Microsoft.AspNetCore.Mvc;
using back.Services.MessageService;
using back.Dtos.Message;
using back.Models;
using back.Dtos.Chat;
using back.Services.ChatService;
using System.Threading.Tasks;
using back.Dtos.User;
using back.Data;
using Microsoft.EntityFrameworkCore;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ApplicationDBContext _context;

        public ChatController(IChatService chatService, ApplicationDBContext context)
        {
            _context = context;
            _chatService = chatService;
        }

        [HttpPost]
        public async Task<ActionResult<ServiceResponse<GetChatDto>>> MatchUsers(int userId)
        {
            Console.WriteLine("Matching users");
            return await _chatService.MatchUsers(userId);
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<int>>> DeleteChat(int id)
        {
            Console.WriteLine("Deleting chat");
            return await _chatService.DeleteChat(id);
        }
    }
}