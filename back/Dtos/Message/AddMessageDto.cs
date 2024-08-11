using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace back.Dtos.Message
{
    public class AddMessageDto
    {
        public string Content { get; set; } = string.Empty;
        public int ChatId { get; set; }
        public int UserId { get; set; }
        
    }
}