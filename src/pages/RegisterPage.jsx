import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!name || !surname || !nickname || !email || !password) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            const res = await axios.post(
                API_CONFIG.GRAPHQL_ENDPOINT,
                {
                    query: GRAPHQL_MUTATIONS.REGISTER_USER,
                    variables: {
                        input: {
                            name,
                            surname,
                            nickname,
                            email,
                            password,
                        },
                    },
                }
            );

            if (res.data.errors) {
                throw new Error(res.data.errors[0].message);
            }

            login(res.data.data.auth.registerUser.token);
            navigate("/");
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.response?.data?.errors?.[0]?.message || err.message || "Error registering user");
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </p>
            </div>

            <div className="auth-right">
                <div className="form-card wide">
                    <h1>Register</h1>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <p className="login-error">{error}</p>}

                    <button
                        className="pill-btn register"
                        onClick={handleSubmit}
                    >
                        Register
                    </button>
                    <button
                        className="pill-btn login"
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </button>

                    <div className="social-login-circles">
                        <button
                            className="circle-btn google"
                            onClick={handleGoogleLogin}
                        >
                            <img
                                src={require("../images/google-logo.png")}
                                alt="Google"
                                className="social-img"
                            />
                        </button>
                        <button
                            className="circle-btn facebook"
                            onClick={handleFacebookLogin}
                        >
                            <img
                                src={require("../images/facebook-logo.png")}
                                alt="Facebook"
                                className="social-img"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
