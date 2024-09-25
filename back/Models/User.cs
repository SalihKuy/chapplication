using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models
{
    public class User
    {
        public int Id { get; set; } = 0;

        [Column(TypeName = "text")]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "text")]
        public string Email { get; set; } = string.Empty;

        public byte[] Hash { get; set; } = new byte[0];

        public byte[] Salt { get; set; } = new byte[0];
        public string? VerificationToken { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; } = false;
        public DateTime TokenCreationTime { get; set; } = new DateTime();

        public ICollection<UserChat> UserChats { get; set; } = new List<UserChat>();

        public User()
        {
            UserChats = new List<UserChat>();
        }

        public User(string name, string email, byte[] hash, byte[] salt)
        {
            Name = name;
            Email = email;
            Hash = hash;
            Salt = salt;
            UserChats = new List<UserChat>();
        }

        public User(string name, string email, byte[] hash, byte[] salt, List<UserChat> userChats)
        {
            Name = name;
            Email = email;
            Hash = hash;
            Salt = salt;
            UserChats = userChats ?? new List<UserChat>();
        }
    }
}