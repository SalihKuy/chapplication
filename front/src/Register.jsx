import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config.js";
import "./Auth.css";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function handleRegister(e) {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        if (!username || !email || !password) {
            setErrorMessage("All fields are required");
            setIsLoading(false);
            return;
        }
    
        axios.post(`${API_BASE_URL}/Auth/Register`, {
            Name: username,
            Email: email,
            Password: password
        }, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        })
        .then(response => {
            if (response.data.success === true) {
                console.log("Register successful:", response.data);
                navigate("/Interface");
            }
        })
        .catch(error => {
            console.log("Registration error:", error);
            console.log("Error response:", error.response);
            console.log("Error response data:", error.response?.data);
            
            if (error.response) {
                if (error.response.status === 400) {
                    const message = error.response.data?.Message || error.response.data?.message;
                    if (message === "Email already exists.") {
                        setErrorMessage("Email already exists");
                    } else if (message === "Username already exists.") {
                        setErrorMessage("Username already exists");
                    } else {
                        setErrorMessage(message || "Registration failed");
                    }
                } else {
                    setErrorMessage("Registration failed. Please try again.");
                }
            } else {
                setErrorMessage("Network error. Please check your connection.");
            }
        })
        .finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Join Us</h1>
                    <p className="auth-subtitle">Create your account to get started</p>
                </div>
                
                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <input 
                            className="form-input"
                            type="text" 
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input 
                            className="form-input"
                            type="email" 
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input 
                            className="form-input"
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className={`auth-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? '' : 'Create Account'}
                    </button>
                    
                    {errorMessage && (
                        <div className="error-message">
                            {errorMessage}
                        </div>
                    )}
                </form>
                
                <div className="info-text">
                    Please check your email&apos;s spam folder after registering.
                </div>
                
                <div className="auth-footer">
                    <p>
                        Already have an account? {' '}
                        <a href="/login" className="auth-link">
                            Sign in here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;