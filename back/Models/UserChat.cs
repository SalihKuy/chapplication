using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Models;

namespace back.Models
{
    public class UserChat
    {
        public int UserId { get; set; }
        public User User { get; set; } = new User();

        public int ChatId { get; set; }
        public Chat Chat { get; set; } = new Chat();
    }
}