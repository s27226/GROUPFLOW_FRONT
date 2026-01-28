import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { authStyles } from "../../components/layout";
import { useGraphQL } from "../../hooks";
import { GRAPHQL_MUTATIONS } from "../../queries/graphql";
import { translateError } from "../../utils/errorTranslation";

interface ChangePasswordResponse {
    auth?: {
        changePassword?: boolean;
    };
}

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { executeMutation } = useGraphQL();

    const handleReset = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError(t('auth.newPasswordsDoNotMatch'));
            return;
        }

        if (newPassword.length < 8) {
            setError(t('auth.passwordTooShort'));
            return;
        }

        setLoading(true);
        try {
            const result = await executeMutation<ChangePasswordResponse>(GRAPHQL_MUTATIONS.CHANGE_PASSWORD, {
                input: {
                    currentPassword,
                    newPassword
                }
            });

            if (result?.auth?.changePassword) {
                setSuccess(t('auth.passwordUpdated'));
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(t('auth.passwordResetFailed'));
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error();
            setError(translateError(error.message, 'auth.passwordResetFailed'));
        } finally {
            setLoading(false);
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

                    <button 
                        className={authStyles.pillBtnLogin} 
                        onClick={handleReset}
                        disabled={loading}
                    >
                        {loading ? t('common.loading') : t('auth.resetPassword')}
                    </button>
                    <button className={authStyles.pillBtnRegister} onClick={() => navigate("/settings")}>
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
