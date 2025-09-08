import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      setMessage("Invalid verification link.");
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    console.log("Starting email verification with token:", token);
    try {
      console.log("Making fetch request to backend...");
      const response = await fetch(`https://d1acbf1a110a.ngrok-free.app/Auth/verify-email?token=${token}`);
      console.log("Response received:", response);
      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.Success) {
        console.log("Verification successful");
        setMessage("Email verified successfully!");
      } else {
        console.log("Verification failed:", data.Message);
        setMessage(`Email verification failed: ${data.Message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setMessage("An error occurred during verification.");
    }
  };

  return (
    <div>
      <h1 style={{display:"flex", justifyContent:"center", alignItems:"center"}}>{message}</h1>
    </div>
  );
};

export default VerifyEmail;