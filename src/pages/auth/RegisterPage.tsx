import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_MUTATIONS } from "../../queries/graphql";
import { useGraphQL } from "../../hooks";
import { AuthLayout, authStyles } from "../../components/layout";

interface AuthResponse {
    auth: {
        registerUser: {
            id: string;
            name: string;
            surname: string;
            nickname: string;
            email: string;
            profilePic?: string;
            isModerator?: boolean;
        };
    };
}

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
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
            const data = await executeQuery<AuthResponse>(GRAPHQL_MUTATIONS.REGISTER_USER, {
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
            const error = err as Error;
            setError(error.message || "Error registering user");
        }
    };

    return (
        <AuthLayout>
            <div className={authStyles.formCardWide}>
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

                {error && <p className={authStyles.loginError}>{error}</p>}

                <button className={authStyles.pillBtnRegister} onClick={handleSubmit}>
                    Register
                </button>
                <button className={authStyles.pillBtnLogin} type="button" onClick={() => navigate("/login")}>
                    Back to Login
                </button>
            </div>
        </AuthLayout>
    );
}
