// Configuration file for the frontend application
// Copy this file to config.js and fill in your actual values

export const config = {
  // Backend API URL
  apiUrl: 'http://localhost:5000/api', // or your production API URL
  
  // WebSocket/SignalR Hub URL  
  hubUrl: 'http://localhost:5000/chatHub', // or your production hub URL
  
  // Other configuration options
  environment: 'development', // 'development' | 'production'
  
  // Add any other sensitive configuration here
};
