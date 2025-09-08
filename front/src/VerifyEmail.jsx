import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API_BASE_URL from "./config.js";
import "./Auth.css";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [isSuccess, setIsSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      setMessage("Invalid verification link.");
      setIsSuccess(false);
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    console.log("Starting email verification with token:", token);
    try {
      console.log("Making fetch request to backend...");
      const response = await fetch(`${API_BASE_URL}/Auth/verify-email?token=${token}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log("Response received:", response);
      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.success) {
        console.log("Verification successful");
        setMessage("Email verified successfully!");
        setIsSuccess(true);
      } else {
        console.log("Verification failed:", data.message);
        setMessage(`Email verification failed: ${data.message || "Unknown error"}`);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setMessage("An error occurred during verification.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isLoading ? "Verifying..." : isSuccess ? "Success!" : "Verification Failed"}
          </h1>
          <p className="auth-subtitle">
            {isLoading ? "Please wait while we verify your email" : "Email verification result"}
          </p>
        </div>
        
        <div style={{ textAlign: "center", margin: "2rem 0" }}>
          {isLoading && (
            <div style={{ 
              width: "40px", 
              height: "40px", 
              border: "4px solid #e1e8ed", 
              borderTop: "4px solid #667eea", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem"
            }}></div>
          )}
          
          <div className={isSuccess === true ? "success-message" : isSuccess === false ? "error-message" : ""}>
            {message}
          </div>
        </div>
        
        {!isLoading && (
          <div className="auth-footer">
            <p>
              <a href="/login" className="auth-link">
                {isSuccess ? "Continue to Login" : "Back to Login"}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;