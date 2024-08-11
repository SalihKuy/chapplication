using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models
{
    public class Message
    {
        public int Id { get; set; }

        [Column(TypeName = "text")]
        public string Content { get; set; } = string.Empty;
        
        public DateTime Date { get; set; }
        public int ChatId { get; set; }
        public Chat Chat { get; set; } = new Chat();
        
        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; } = new User();

        public Message() 
        {
            Date = DateTime.Now;
        }

        public Message(string content, int chatId, int userId)
        {
            Content = content;
            Date = DateTime.Now;
            ChatId = chatId;
            UserId = userId;
        }

        public Message(string content, DateTime date, int chatId, int userId)
        {
            Content = content;
            Date = date;
            ChatId = chatId;
            UserId = userId;
        }
    }
}