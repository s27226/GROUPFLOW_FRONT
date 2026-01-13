import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_MUTATIONS } from "../../queries/graphql";
import { useGraphQL } from "../../hooks";
import { AuthLayout, authStyles } from "../../components/layout";
import { SocialLoginButtons } from "../../components/common";

interface AuthResponse {
    auth: {
        loginUser: {
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

export default function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const { executeQuery } = useGraphQL();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            const data = await executeQuery<AuthResponse>(GRAPHQL_MUTATIONS.LOGIN_USER, {
                input: {
                    email,
                    password
                }
            });

            const authData = data.auth.loginUser;
            // JWT token is set as HTTP-only cookie by the server
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
            console.error("Login error:", err);
            const error = err as Error;
            setError(error.message || t('auth.invalidCredentials'));
        }
    };

    const handleGoogleLogin = () => {
        setError(t('auth.googleNotImplemented'));
    };

    const handleFacebookLogin = () => {
        setError(t('auth.facebookNotImplemented'));
    };

    return (
        <AuthLayout>
            <div className={authStyles.formCardWide}>
                <h1>{t('auth.login')}</h1>
                <input
                    type="email"
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className={authStyles.loginError}>{error}</p>}
                <button className={authStyles.pillBtnLogin} type="submit" onClick={handleSubmit}>
                    {t('auth.signIn')}
                </button>
                <button
                    className={authStyles.pillBtnRegister}
                    type="button"
                    onClick={() => navigate("/register")}
                >
                    {t('auth.register')}
                </button>

                <SocialLoginButtons
                    onGoogleClick={handleGoogleLogin}
                    onFacebookClick={handleFacebookLogin}
                />
            </div>
        </AuthLayout>
    );
}
