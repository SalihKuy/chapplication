using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using back.Dtos.User;
using back.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using back.Dtos.Chat;
using back.Dtos.Message;
using back.Services.EmailAuthService;

namespace back.Data
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDBContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailAuthService _emailAuthService;
        public AuthRepository(ApplicationDBContext context, IConfiguration configuration, IEmailAuthService emailAuthService)
        {
            _context = context;
            _configuration = configuration;
            _emailAuthService = emailAuthService;
        }
        public async Task<ServiceResponse<int>> Register(User user, string password)
        {
            var response = new ServiceResponse<int>
            {
                Data = user.Id
            };
            if (await UserEmailExists(user.Email))
            {
                response.Success = false;
                response.Message = "Email already exists.";
                return response;
            }
            else if (await UserNameExists(user.Name))
            {
                response.Success = false;
                response.Message = "Username already exists.";
                return response;
            }
            CreatePasswordHash(password, out byte[] hash, out byte[] salt);
            user.Hash = hash;
            user.Salt = salt;
            var userIds = await _context.Users.Select(u => u.Id).ToListAsync();

            user.VerificationToken = _emailAuthService.GenerateRandomString();
            user.TokenCreationTime = DateTime.UtcNow;
            user.EmailConfirmed = false;

            bool emailSent = _emailAuthService.SendVerificationEmail(user.Email, user.VerificationToken);

            if (emailSent)
            {
                response.Success = true;
                response.Data = user.Id;
                response.Message = "Registration successful. Please check your email to verify your account.";
            }
            else
            {
                response.Success = false;
                response.Message = "Registration successful, but failed to send verification email. Please contact support.";
            }

            int newId = (userIds.DefaultIfEmpty(0).Max()) + 1;

            user.Id = newId;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return response;
        }

        public async Task<ServiceResponse<bool>> VerifyEmail(string token)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.VerificationToken == token);
            var response = new ServiceResponse<bool>();

            if (user == null)
            {
                response.Success = false;
                response.Message = "Invalid token.";
                return response;
            }

            if (user.EmailConfirmed)
            {
                response.Success = false;
                response.Message = "Email already verified.";
                return response;
            }

            if ((DateTime.UtcNow - user.TokenCreationTime).TotalHours > 24)
            {
                response.Success = false;
                response.Message = "Token has expired.";
                return response;
            }

            user.EmailConfirmed = true;
            user.VerificationToken = null;
            await _context.SaveChangesAsync();

            response.Success = true;
            response.Data = true;
            response.Message = "Email verified successfully.";
            return response;
        }

        public async Task<ServiceResponse<GetUserDto>> Login(string email, string password)
        {
            var response = new ServiceResponse<GetUserDto>();
            var user = await _context.Users
            .Include(u => u.UserChats)
            .ThenInclude(uc => uc.Chat)
            .ThenInclude(c => c.Messages)
            .FirstOrDefaultAsync(u => u.Email.ToLower().Equals(email.ToLower()));
            if (user is null)
            {
                response.Success = false;
                response.Message = "User not found.";
                return response;
            }
            else if (!VerifyPasswordHash(password, user.Hash, user.Salt))
            {
                response.Success = false;
                response.Message = "Wrong password.";
                return response;
            }
            else if (!user.EmailConfirmed)
            {
                response.Success = false;
                response.Message = "Email not verified. Please check your email for the verification link.";
                return response;
            }

            var userDto = new GetUserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Token = CreateToken(user),
                Chats = user.UserChats.Select(uc => new GetChatDto
                {
                    Id = uc.Chat.Id,
                    Name = uc.Chat.Name,
                    RecentMessages = uc.Chat.Messages
                        .OrderByDescending(message => message.Date)
                        .Take(30)
                        .Select(message => new GetMessageDto
                        {
                            Id = message.Id,
                            Content = message.Content,
                            Date = message.Date,
                            ChatId = message.ChatId,
                            UserId = message.UserId
                        })
                        .ToList()
                }).ToList()
            };
            response.Data = userDto;
            return response;
        }

        public async Task<bool> UserEmailExists(string email)
        {
            try
            {
                return await _context.Users
                    .AnyAsync(u => u.Email.ToLower().Equals(email.ToLower()));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error querying UserEmailExists: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> UserNameExists(string name)
        {
            try
            {
                return await _context.Users
                    .AnyAsync(u => u.Name.ToLower().Equals(name.ToLower()));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error querying UserNameExists: {ex.Message}");
                return false;
            }
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }
        private bool VerifyPasswordHash(string Password, byte[] hash, byte[] salt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512(salt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(Password));
                return computedHash.SequenceEqual(hash);
            }
        }
        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name)
            };

            var appSettingsToken = _configuration.GetSection("AppSettings:Token").Value;
            if (appSettingsToken is null)
            {
                throw new Exception("AppSettings:Token is not defined in appsettings.json");
            }

            SymmetricSecurityKey key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(appSettingsToken));

            SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}