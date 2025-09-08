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
    try {
      const response = await fetch(`https://d1acbf1a110a.ngrok-free.app/Auth/verify-email?token=${token}`);
      const data = await response.json();
      if (data.Success) {
        setMessage("Email verified successfully!");
      } else {
        setMessage(`Email verification failed: ${data.Message || "Unknown error"}`);
      }
    } catch (error) {
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