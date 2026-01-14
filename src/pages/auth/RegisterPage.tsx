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
    const { t } = useTranslation();
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
            setError(t('auth.allFieldsRequired'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('auth.passwordTooShort'));
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
                id: Number(authData.id),
                name: authData.name,
                surname: authData.surname,
                nickname: authData.nickname,
                email: authData.email,
                profilePicUrl: authData.profilePic,
                isModerator: authData.isModerator
            });
            navigate("/");
        } catch (err) {
            console.error("Registration error:", err);
            const error = err as Error;
            setError(error.message || t('auth.registrationError'));
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
                <h1>{t('auth.register')}</h1>
                <input
                    type="text"
                    placeholder={t('auth.firstName')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder={t('auth.lastName')}
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                />
                <input
                    type="text"
                    placeholder={t('auth.nickname')}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
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
                <input
                    type="password"
                    placeholder={t('auth.repeatPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className={authStyles.loginError}>{error}</p>}

                <button className={authStyles.pillBtnRegister} onClick={handleSubmit}>
                    {t('auth.register')}
                </button>
                <button className={authStyles.pillBtnLogin} type="button" onClick={() => navigate("/login")}>
                    {t('auth.backToLogin')}
                </button>

                <SocialLoginButtons
                    onGoogleClick={handleGoogleLogin}
                    onFacebookClick={handleFacebookLogin}
                />
            </div>
        </AuthLayout>
    );
}
