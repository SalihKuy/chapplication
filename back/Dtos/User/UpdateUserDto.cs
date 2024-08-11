using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Models;

namespace back.Dtos.User
{
    public class UpdateUserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public List<Models.Chat>? Chats { get; set; }
    }
}