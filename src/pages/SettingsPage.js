import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/SettingsPage.css";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "medium");
    const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const handleFontSizeChange = (size) => {
        const value = size === "small" ? "0.9rem" : size === "large" ? "1.1rem" : "1rem";
        setFontSize(size);
        document.documentElement.style.setProperty("--font-size-base", value);
        localStorage.setItem("fontSize", size);
    };

    const handleLanguageChange = (lang) => {
        localStorage.setItem("language", lang);
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        const fontValue =
            fontSize === "small" ? "0.9rem" : fontSize === "large" ? "1.1rem" : "1rem";
        document.documentElement.style.setProperty("--font-size-base", fontValue);
    }, []);

    return (
        <div className="settings-layout">
            <Navbar />
            <div className="settings-content">
                <Sidebar />

                <div className="settings-main">
                    <h3>Settings</h3>

                    <div className="option-section">
                        <div className="option-row">
                            <div className="option-label">
                                <span>Theme</span>
                                <p className="option-description">
                                    Choose between dark and light mode
                                </p>
                            </div>
                            <div>
                                <button
                                    className={theme === "dark" ? "active" : ""}
                                    onClick={() => handleThemeChange("dark")}
                                >
                                    Dark
                                </button>
                                <button
                                    className={theme === "light" ? "active" : ""}
                                    onClick={() => handleThemeChange("light")}
                                >
                                    Light
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="option-section">
                        <div className="option-row">
                            <div className="option-label">
                                <span>Language</span>
                                <p className="option-description">Select your preferred language</p>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="settings-select"
                            >
                                <option value="en">English</option>
                                <option value="pl">Polish</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                    </div>

                    <div className="option-section">
                        <div className="option-row">
                            <div className="option-label">
                                <span>Font Size</span>
                                <p className="option-description">
                                    Adjust the base font size for better readability
                                </p>
                            </div>
                            <div>
                                <button
                                    className={fontSize === "small" ? "active" : ""}
                                    onClick={() => handleFontSizeChange("small")}
                                >
                                    Small
                                </button>
                                <button
                                    className={fontSize === "medium" ? "active" : ""}
                                    onClick={() => handleFontSizeChange("medium")}
                                >
                                    Medium
                                </button>
                                <button
                                    className={fontSize === "large" ? "active" : ""}
                                    onClick={() => handleFontSizeChange("large")}
                                >
                                    Large
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="option-section">
                        <div className="option-row">
                            <div className="option-label">
                                <span>Reset Password</span>
                                <p className="option-description">Change your account password</p>
                            </div>
                            <button onClick={() => navigate("/settings/reset-pass")}>Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
