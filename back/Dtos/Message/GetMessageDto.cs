using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace back.Dtos.Message
{
    public class GetMessageDto
    {
        public int Id { get; set; }

        public string Content { get; set; } = string.Empty;
        
        public DateTime Date { get; set; }
        public int ChatId { get; set; }

        public int UserId { get; set; }
    }
}