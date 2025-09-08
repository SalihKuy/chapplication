# Configuration Setup

This application requires configuration files with sensitive information that are not tracked in Git for security reasons.

## Backend Configuration

### Setting up appsettings.json files

1. Copy the example files and rename them:
   ```bash
   cp back/appsettings.example.json back/appsettings.json
   cp back/appsettings.Development.example.json back/appsettings.Development.json
   cp back/appsettings.Production.example.json back/appsettings.Production.json
   ```

2. Edit each file and replace the placeholder values with your actual configuration:

   - **ConnectionStrings.DefaultConnection**: Your database connection string
   - **AppSettings.Token**: Your JWT secret key (must be at least 64 characters)
   - **EmailSettings.Username**: Your email address for sending emails
   - **EmailSettings.Password**: Your email app password

## Frontend Configuration

### Setting up config.js

1. Copy the example file:
   ```bash
   cp front/src/config.example.js front/src/config.js
   ```

2. Edit the file and update the configuration values:
   - **apiUrl**: Your backend API URL
   - **hubUrl**: Your SignalR hub URL
   - **environment**: Set to 'development' or 'production'

### Security Notes

- Never commit the actual configuration files (`appsettings.json`, `config.js`, etc.)
- Keep your JWT tokens secure and use strong, unique values
- Use app-specific passwords for email authentication
- Store production secrets in secure environment variables or key vaults
- Use HTTPS in production for all API communications

### Environment Variables (Alternative)

Instead of using configuration files, you can also set these as environment variables:

**Backend:**
- `ConnectionStrings__DefaultConnection`
- `AppSettings__Token`
- `EmailSettings__Username`
- `EmailSettings__Password`

**Frontend:**
- `VITE_API_URL`
- `VITE_HUB_URL`
- `VITE_ENVIRONMENT`
