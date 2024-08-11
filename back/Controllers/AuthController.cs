using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using back.Models;
using back.Data;
using back.Dtos.User;
using Microsoft.AspNetCore.Authorization;

namespace back.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        public AuthController(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }
        [HttpGet("ValidateToken")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            return Ok(new { success = true });
        }
        [HttpPost("Register")]
        public async Task<ActionResult<ServiceResponse<int>>> Register(UserRegisterDto request)
        {
            var response = await _authRepository.Register(
                new User { Name = request.Name, Email = request.Email }, request.Password
            );
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response); 
        }
        [HttpPost("Login")]
        public async Task<ActionResult<ServiceResponse<GetUserDto>>> Login(UserLoginDto request)
        {
            var response = await _authRepository.Login(request.Email, request.Password);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response); 
        }
    }
}