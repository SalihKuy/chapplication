using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Dtos.Message;

namespace back.Dtos.Chat
{
    public class GetChatDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        public ICollection<GetMessageDto> RecentMessages { get; set; } = new List<GetMessageDto>();
    }
}