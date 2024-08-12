using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using back.Services.UserService;
using back.Dtos.User;
using back.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace back.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("{id}")]
        public Task<ServiceResponse<GetUserDto>> GetUser(int id)
        {
            string userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            if(userId != id.ToString()) {
                return Task.FromResult(new ServiceResponse<GetUserDto>
                {
                    Success = false,
                    Message = "You can only get your own user"
                });
            }
            Console.WriteLine("Getting user by id");
            return _userService.GetUser(id);
        }
        [HttpPost]
        public Task<ServiceResponse<GetUserDto>> AddUser(AddUserDto newUser)
        {
            Console.WriteLine("Adding user");
            return _userService.AddUser(newUser);
        }
    }
}