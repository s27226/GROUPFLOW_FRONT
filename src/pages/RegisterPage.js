import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import axios from "axios";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:4000/api/register", {
                name,
                email,
                password,
            });
            login(res.data.user);
            navigate("/");
        } catch (err) {
            setError("Error registering user");
        }
    };

    const handleGoogleLogin = () => {
        setError("Google login not implemented yet!");
    };

    const handleFacebookLogin = () => {
        setError("Facebook login not implemented yet!");
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <h1 className="auth-title">Welcome to the App</h1>
                <p className="auth-desc">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </div>

            <div className="auth-right">
                <div className="form-card wide">
                    <h1>PLACEHOLDER_NAME</h1>
                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input placeholder="Repeat Password" type="password" />

                    {error && <p className="login-error">{error}</p>}

                    <button className="pill-btn register" onClick={handleSubmit}>Register</button>

                    <div className="social-login-circles">
                        <button className="circle-btn google" onClick={handleGoogleLogin}>
                            <img src={require("../images/google-logo.png")} alt="Google" className="social-img"/>
                        </button>
                        <button className="circle-btn facebook" onClick={handleFacebookLogin}>
                            <img src={require("../images/facebook-logo.png")} alt="Facebook" className="social-img"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}