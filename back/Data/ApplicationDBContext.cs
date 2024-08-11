using Microsoft.EntityFrameworkCore;
using back.Models;

namespace back.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<UserChat> UserChats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserChat>()
                .HasKey(uc => new { uc.UserId, uc.ChatId });

            modelBuilder.Entity<UserChat>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserChats)
                .HasForeignKey(uc => uc.UserId);

            modelBuilder.Entity<UserChat>()
                .HasOne(uc => uc.Chat)
                .WithMany(c => c.UserChats)
                .HasForeignKey(uc => uc.ChatId);

            modelBuilder.Entity<Chat>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Chat)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Chat>()
                .Property(c => c.Id)
                .ValueGeneratedNever();

            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .ValueGeneratedNever();

            modelBuilder.Entity<Message>()
                .Property(m => m.Id)
                .ValueGeneratedNever();

            modelBuilder.Entity<UserChat>()
                .Property(uc => uc.UserId)
                .ValueGeneratedNever();

            modelBuilder.Entity<UserChat>()
                .Property(uc => uc.ChatId)
                .ValueGeneratedNever();
        }
    }
}