using AutoMapper;
using back.Dtos.Chat;
using back.Dtos.Message;
using back.Dtos.User;
using back.Models;

namespace back
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Chat, GetChatDto>();
            CreateMap<Message, GetMessageDto>();
            CreateMap<User, GetUserDto>();
            CreateMap<AddUserDto, User>();
            CreateMap<UpdateUserDto, User>();
            CreateMap<UserRegisterDto, User>();
            CreateMap<UserLoginDto, User>();
            CreateMap<AddMessageDto, Message>();
        }
    }
}