import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authStyles } from "../../components/layout";
import axios, { AxiosError } from "axios";
import { API_CONFIG } from "../../config/api";

export default function ResetPasswordPage() {
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
            setError("New passwords do not match");
            return;
        }

        try {
            await axios.post(API_CONFIG.RESET_PASSWORD_ENDPOINT, {
                currentPassword,
                newPassword
            }, {
                withCredentials: true
            });

            setSuccess("Password successfully updated!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            setError(axiosError.response?.data?.message || "Failed to reset password");
        }
    };

    return (
        <div className={authStyles.authContainer}>
            <div className={authStyles.authRight}>
                <div className={authStyles.formCardWide}>
                    <h1>Reset Password</h1>

                    <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <p className={authStyles.loginError}>{error}</p>}
                    {success && <p className={authStyles.loginSuccess}>{success}</p>}

                    <button className={authStyles.pillBtnLogin} onClick={handleReset}>
                        Reset Password
                    </button>
                    <button className={authStyles.pillBtnRegister} onClick={() => navigate("/settings")}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
