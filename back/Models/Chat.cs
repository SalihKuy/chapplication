using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models
{
    public class Chat
    {
        public int Id { get; set; }

        [Column(TypeName = "text")]
        public string? Name { get; set; }

        public ICollection<Message> Messages { get; set; } = new List<Message>();

        public ICollection<UserChat> UserChats { get; set; } = new List<UserChat>();

        public List<Message> getLast30Messages(int messageId)
        {
            Console.WriteLine("Fetching messages before message ID: " + messageId);
            var filteredMessages = Messages.Where(m => m.Id < messageId);
            Console.WriteLine("Filtered messages count: " + filteredMessages.Count());

            var orderedMessages = filteredMessages.OrderByDescending(m => m.Id).Take(30).OrderBy(m => m.Id);
            Console.WriteLine("Ordered messages count: " + orderedMessages.Count());

            return orderedMessages.ToList();
        }

        public Chat()
        {
            Messages = new List<Message>();
            UserChats = new List<UserChat>();
        }

        public Chat(string name)
        {
            Name = name;
            Messages = new List<Message>();
            UserChats = new List<UserChat>();
        }

        public Chat(string name, List<Message> messages)
        {
            Name = name;
            Messages = messages ?? new List<Message>();
            UserChats = new List<UserChat>();
        }
    }
}