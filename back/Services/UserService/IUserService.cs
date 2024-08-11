using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back.Dtos.User;
using back.Models;

namespace back.Services.UserService
{
    public interface IUserService
    {
        public Task<ServiceResponse<List<GetUserDto>>> GetAllUsers();
        public Task<ServiceResponse<GetUserDto>> GetUser(int id);
        public Task<ServiceResponse<GetUserDto>> AddUser(AddUserDto newUser);
        public Task<ServiceResponse<GetUserDto>> UpdateUser(UpdateUserDto updatedUser);
        public Task<ServiceResponse<List<GetUserDto>>> DeleteUser(int id);
    }
}