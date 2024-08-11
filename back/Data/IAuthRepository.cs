using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Dtos.User;
using back.Models;

namespace back.Data
{
    public interface IAuthRepository
    {
        Task<ServiceResponse<int>> Register(User user, string password);
        Task<ServiceResponse<GetUserDto>> Login(string email, string password);
        Task<bool> UserEmailExists(string email);
        Task<bool> UserNameExists(string name);
    }
}