using System;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using Azure.Identity;
using back.Services.EmailAuthService;

public class EmailAuthService : IEmailAuthService
{
    private readonly string? _SenderEmail;
    private readonly string? _SenderPassword;
    private const string VerificationBaseUrl = "https://chapplication.netlify.app/Auth/verify-email";

    public EmailAuthService(IConfiguration configuration)
    {
        _SenderEmail = configuration["EmailSettings:Username"];
        _SenderPassword = configuration["EmailSettings:Password"];
        if(string.IsNullOrEmpty(_SenderEmail) || string.IsNullOrEmpty(_SenderPassword))
        {
            throw new Exception("Email settings not found in appsettings.json");
        }
    }

    public string GenerateRandomString()
    {
        byte[] randomBytes = new byte[32];
        RandomNumberGenerator.Fill(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public bool SendVerificationEmail(string to, string verificationToken)
    {
        string verificationLink = $"{VerificationBaseUrl}?token={verificationToken}";
        string subject = "Verify Your Email Address";
        string body = $@"
Dear User,

Thank you for registering. Please click the following link to verify your email address:

{verificationLink}

If you didn't request this verification, please ignore this email.

Best regards,
Chapplication.
";
        return SendEmail(to, subject, body);
    }

    private bool SendEmail(string to, string subject, string body)
    {
        try
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(_SenderEmail, _SenderPassword),
                EnableSsl = true,
            };
            if(string.IsNullOrEmpty(_SenderEmail) || string.IsNullOrEmpty(_SenderPassword))
            {
                throw new Exception("Email settings not found in appsettings.json");
            }
            var mailMessage = new MailMessage
            {
                From = new MailAddress(_SenderEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = false,
            };
            mailMessage.To.Add(to);

            smtpClient.Send(mailMessage);
            Console.WriteLine($"Verification email sent successfully to {to}");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in sending email to {to}: {ex.Message}");
            return false;
        }
    }
}