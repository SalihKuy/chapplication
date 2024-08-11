using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Dtos.Message;
using Microsoft.AspNetCore.SignalR;

namespace back.SignalR
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string userId, GetMessageDto message)
        {
            Console.WriteLine("Sending message: " + message);
            await Clients.All.SendAsync("ReceiveMessage", userId, message);
        }
        public async Task JoinChatGroup(string chatId)
        {
            Console.WriteLine("Joining chat group: " + chatId);
            await Groups.AddToGroupAsync(Context.ConnectionId, chatId);
        }

        public async Task LeaveChatGroup(string chatId)
        {
            Console.WriteLine("Leaving chat group: " + chatId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
        }
        
    }
}