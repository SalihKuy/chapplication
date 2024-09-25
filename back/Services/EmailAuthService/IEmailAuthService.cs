using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace back.Services.EmailAuthService
{
    public interface IEmailAuthService
    {
        public string GenerateRandomString();
        public bool SendVerificationEmail(string to, string verificationToken);
    }
}