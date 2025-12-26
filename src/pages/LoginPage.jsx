import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import AuthLayout from "../components/AuthLayout";
import SocialLoginButtons from "../components/SocialLoginButtons";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const { executeQuery } = useGraphQL();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await executeQuery(GRAPHQL_MUTATIONS.LOGIN_USER, {
                input: {
                    email,
                    password
                }
            });

            const authData = data.auth.loginUser;
            console.log('Login response:', authData); // Debug log
            login(authData.token, authData.refreshToken, {
                id: authData.id,
                name: authData.name,
                email: authData.email,
                isModerator: authData.isModerator
            });
            console.log('Is Moderator:', authData.isModerator); // Debug log
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Invalid credentials");
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
                <h1>Login</h1>
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
                {error && <p className="login-error">{error}</p>}
                <button className="pill-btn login" type="submit" onClick={handleSubmit}>
                    Sign In
                </button>
                <button
                    className="pill-btn register"
                    type="button"
                    onClick={() => navigate("/register")}
                >
                    Register
                </button>

                <SocialLoginButtons
                    onGoogleClick={handleGoogleLogin}
                    onFacebookClick={handleFacebookLogin}
                />
            </div>
        </AuthLayout>
    );
}
