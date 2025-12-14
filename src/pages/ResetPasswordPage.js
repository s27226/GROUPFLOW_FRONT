import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import axios from "axios";

export default function ResetPasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        try {
            await axios.post("http://localhost:4000/api/reset-password", {
                currentPassword,
                newPassword
            });

            setSuccess("Password successfully updated!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password");
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-right">
                <div className="form-card wide">
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

                    {error && <p className="login-error">{error}</p>}
                    {success && <p className="login-success">{success}</p>}

                    <button className="pill-btn login" onClick={handleReset}>
                        Reset Password
                    </button>
                    <button
                        className="pill-btn register"
                        onClick={() => navigate("/settings")}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
