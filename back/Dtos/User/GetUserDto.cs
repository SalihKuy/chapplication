using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Dtos.Chat;
using back.Models;

namespace back.Dtos.User
{
    public class GetUserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;
        public List<GetChatDto>? Chats { get; set; }
    }
}