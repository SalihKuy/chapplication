import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config.js";
import "./Auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("token")) {
            axios.get(`${API_BASE_URL}/Auth/ValidateToken`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            })
            .then(response => {
                if (response.data.success === true) {
                    console.log("Token is valid:", response.data);
                    navigate("/Interface");
                }
            })
            .catch(error => {
                console.log(error);
            });
        }
    }, [navigate]);

    function handleLogin(e) {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        axios.post(`${API_BASE_URL}/Auth/Login`, {
            Email: email,
            password: password
        }, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        })
        .then(response => {
            console.log("Login response:", response.data);
            if (response.data.success === true) {
                console.log("Login successful:", response.data.data);
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("id", response.data.data.id);
                navigate("/Interface");
            } else {
                console.log("Login failed:", response.data.message);
                setErrorMessage(response.data.message || "Login failed");
            }
        })
        .catch(error => {
            console.log("Login error:", error);
            if (error.response) {
                if (error.response.status === 400) {
                    const message = error.response.data.Message || error.response.data.message;
                    if (message === "User not found." || message === "Wrong password.") {
                        setErrorMessage("Invalid email or password");
                    } else if(message === "Email not verified. Please check your email for the verification link.") {
                        setErrorMessage(message);
                    } else {
                        setErrorMessage(message || "Login failed");
                    }
                } else {
                    setErrorMessage("An error occurred during login");
                }
            } else {
                setErrorMessage("Network error occurred");
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
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>
                
                <form className="auth-form" onSubmit={handleLogin}>
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
                        {isLoading ? '' : 'Sign In'}
                    </button>
                    
                    {errorMessage && (
                        <div className="error-message">
                            {errorMessage}
                        </div>
                    )}
                </form>
                
                <div className="auth-footer">
                    <p>
                        Don&apos;t have an account? {' '}
                        <a href="/register" className="auth-link">
                            Create one here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;