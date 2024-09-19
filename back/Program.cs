using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using back.Data;
using back.Models;
using back.Services.UserService;
using back.Services.ChatService;
using back.Services.MessageService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Swashbuckle.AspNetCore.Filters;
using Microsoft.OpenApi.Models;
using back;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using back.SignalR;
using System.Text.Json;
using System.Text.Json.Serialization;

Console.WriteLine("Creating builder");
var builder = WebApplication.CreateBuilder(args);

Console.WriteLine("Adding Controllers");
builder.Services.AddControllers();
Console.WriteLine("Adding EndpointsApiExplorer");
builder.Services.AddEndpointsApiExplorer();
Console.WriteLine("Adding Swagger Gen");
builder.Services.AddSwaggerGen(c => {
    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme {
        Description = """Standart Authorization header using the Bearer scheme. Example: \"bearer {token}\" """,
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey 
    });
    c.OperationFilter<SecurityRequirementsOperationFilter>();
});

Console.WriteLine("Adding Cors");
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

Console.WriteLine("Adding AutoMapper");
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));
Console.WriteLine("Adding User Service");
builder.Services.AddScoped<IUserService, UserService>();
Console.WriteLine("Adding Chat Service");
builder.Services.AddScoped<IChatService, ChatService>();
Console.WriteLine("Adding Message Service");
builder.Services.AddScoped<IMessageService, MessageService>();
Console.WriteLine("Adding Auth Repository");
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
Console.WriteLine("Adding DBContext");
builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

Console.WriteLine("Adding Authentication");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

Console.WriteLine("Adding SignalR");
builder.Services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(10);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
})
.AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions = new JsonSerializerOptions
    {
        ReferenceHandler = ReferenceHandler.Preserve,
        WriteIndented = true
    };
});
Console.WriteLine("Building App");
var app = builder.Build();

Console.WriteLine("Adding IsDevelopment");
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}


// app.UseHttpsRedirection();
Console.WriteLine("Allowing Localhost");
app.UseCors("AllowLocalhost");
Console.WriteLine("Using Authentication");
app.UseAuthentication();
Console.WriteLine("Using Authorization");
app.UseAuthorization();
Console.WriteLine("Mapping Controllers");
app.MapControllers();
Console.WriteLine("Adding SignalR Hub");
app.MapHub<ChatHub>("/chathub").RequireCors("AllowLocalhost");
Console.WriteLine("Migrating Database");
DatabaseMigrator.MigrateDatabase(app);

Console.WriteLine("Running App");
try
{
    Console.WriteLine("Running App");
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"Application terminated unexpectedly. {ex}");
}