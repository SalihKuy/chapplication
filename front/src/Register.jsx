import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    function handleRegister(e) {
        e.preventDefault();

        if (!username || !email || !password) {
            setErrorMessage("All fields are required");
            return;
        }
    
        axios.post("https://dockerchat-production.up.railway.app/Auth/Register", {
            Name: username,
            Email: email,
            Password: password
        })
        .then(response => {
            if (response.data.success === true) {
                console.log("Register successful:", response.data);
                navigate("/Interface");
            }
        })
        .catch(error => {
            if (error.response) {
                if (error.response.status === 400) {
                    if (error.response.data.message === "Email already exists.") {
                        setErrorMessage("Email already exists");
                    } else if (error.response.data.message === "Username already exists.") {
                        setErrorMessage("Username already exists");
                    }
                }
            }
        });
    }

    

    return (
        <>
            <div style={{ display: "grid", gridTemplateRows: "repeat(10, 1fr)", gridTemplateColumns: "repeat(15, 1fr)", height: "100vh", width: "100vw", backgroundColor:"#333333"}}>
                <div style={{ display: "flex", flexDirection: "column", gridColumnStart: "4", gridColumnEnd: "8", gridRowStart: "2", gridRowEnd: "10", backgroundColor: "#444444", borderRadius: "5%" }}>
                    <div style={{ flex: "2", display: "flex", justifyContent: "center", alignItems: "center" }}></div>
                    <p style={{ flex: "1", textAlign: "center", fontSize: "2em", color:"#FFFFFF" }}>Register</p>
                    <form style={{ flex: "10", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }} onSubmit={handleRegister}>
                        <div style={{ flex: "1", display: "flex", justifyContent: "center", alignItems: "center" }}></div>
                        <input onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Username" style={{ margin: "10px", width: "200px", height: "30px", backgroundColor:"#222222", color:"#DDDDDD"}}></input>
                        <div style={{ flex: "0.01", display: "flex", justifyContent: "center", alignItems: "center" }}></div>
                        <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" style={{ margin: "10px", width:"200px", height:"30px", backgroundColor:"#222222", color:"#DDDDDD"}}></input>
                        <div style={{ flex: "0.01", display: "flex", justifyContent: "center", alignItems: "center" }}></div>
                        <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" style={{ margin:"10px", width:"200px", height:"30px", backgroundColor:"#222222", color:"#DDDDDD"}}></input>
                        <div style={{ flex: "0.2", display: "flex", justifyContent: "center", alignItems: "center" }}></div>
                        <button onClick={handleRegister} style={{ width: "200px", height: "30px", borderRadius: "15px", backgroundColor:"#111111", color:"#DDDDDD"}}>Register</button>
                        <div style={{ flex: "0.1", display: "flex", justifyContent: "center", alignItems: "center" }}></div>
                        <div style={{ display: "flex", flexDirection: "column", flex: "3" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", flex: "3" }}>
                                <p style={{ margin: "0", marginRight: "5px", marginTop: "5px", color:"#EEEEEE" }}>Already a member?</p>
                                <a href="/login" style={{ textDecoration: "none", marginTop: "5px", color:"#301934"}}>Log in</a>
                            </div>
                            <div style={{ flex: "10", justifyContent: "center", alignItems: "center" }}></div>
                        </div>
                        {errorMessage && <p style={{flex:"2", color: "red" }}>{errorMessage}</p>}
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login