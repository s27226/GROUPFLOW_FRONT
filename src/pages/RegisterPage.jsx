import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import AuthLayout from "../components/AuthLayout";
import SocialLoginButtons from "../components/SocialLoginButtons";

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
    const { executeQuery } = useGraphQL();

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
            const data = await executeQuery(GRAPHQL_MUTATIONS.REGISTER_USER, {
                input: {
                    name,
                    surname,
                    nickname,
                    email,
                    password
                }
            });

            const authData = data.auth.registerUser;
            login({
                id: authData.id,
                name: authData.name,
                surname: authData.surname,
                nickname: authData.nickname,
                email: authData.email,
                profilePic: authData.profilePic,
                isModerator: authData.isModerator
            });
            navigate("/");
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "Error registering user");
        }
    };

    const handleGoogleLogin = () => {
        setError("Google login not implemented yet!");
    };

    const handleFacebookLogin = () => {
        setError("Facebook login not implemented yet!");
    };

    return (
        <AuthLayout>
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

                <button className="pill-btn register" onClick={handleSubmit}>
                    Register
                </button>
                <button className="pill-btn login" type="button" onClick={() => navigate("/login")}>
                    Back to Login
                </button>

                <SocialLoginButtons
                    onGoogleClick={handleGoogleLogin}
                    onFacebookClick={handleFacebookLogin}
                />
            </div>
        </AuthLayout>
    );
}
