import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { authStyles } from "../../components/layout";
import axios, { AxiosError } from "axios";
import { API_CONFIG } from "../../config/api";

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleReset = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError(t('auth.newPasswordsDoNotMatch'));
            return;
        }

        try {
            await axios.post(API_CONFIG.RESET_PASSWORD_ENDPOINT, {
                currentPassword,
                newPassword
            }, {
                withCredentials: true
            });

            setSuccess(t('auth.passwordUpdated'));
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            setError(axiosError.response?.data?.message || t('auth.passwordResetFailed'));
        }
    };

    return (
        <div className={authStyles.authContainer}>
            <div className={authStyles.authRight}>
                <div className={authStyles.formCardWide}>
                    <h1>{t('auth.resetPassword')}</h1>

                    <input
                        type="password"
                        placeholder={t('auth.currentPassword')}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder={t('auth.newPassword')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder={t('auth.confirmNewPassword')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <p className={authStyles.loginError}>{error}</p>}
                    {success && <p className={authStyles.loginSuccess}>{success}</p>}

                    <button className={authStyles.pillBtnLogin} onClick={handleReset}>
                        {t('auth.resetPassword')}
                    </button>
                    <button className={authStyles.pillBtnRegister} onClick={() => navigate("/settings")}>
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
