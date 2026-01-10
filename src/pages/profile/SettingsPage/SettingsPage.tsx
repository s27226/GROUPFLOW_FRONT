import { useEffect, useState } from "react";
import { Navbar, Sidebar } from "../../../components/layout";
import styles from "./SettingsPage.module.css";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "medium");
    const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const handleFontSizeChange = (size: string) => {
        const value = size === "small" ? "0.9rem" : size === "large" ? "1.1rem" : "1rem";
        setFontSize(size);
        document.documentElement.style.setProperty("--font-size-base", value);
        localStorage.setItem("fontSize", size);
    };

    const handleLanguageChange = (lang: string) => {
        localStorage.setItem("language", lang);
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        const fontValue =
            fontSize === "small" ? "0.9rem" : fontSize === "large" ? "1.1rem" : "1rem";
        document.documentElement.style.setProperty("--font-size-base", fontValue);
    }, [theme, fontSize]);

    return (
        <div className={styles.settingsLayout}>
            <Navbar />
            <div className={styles.settingsContent}>
                <Sidebar />

                <div className={styles.settingsMain}>
                    <h3>Settings</h3>

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>Theme</span>
                                <p className={styles.optionDescription}>
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

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>Language</span>
                                <p className={styles.optionDescription}>Select your preferred language</p>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className={styles.settingsSelect}
                            >
                                <option value="en">English</option>
                                <option value="pl">Polish</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>Font Size</span>
                                <p className={styles.optionDescription}>
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
                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>Reset Password</span>
                                <p className={styles.optionDescription}>Change your account password</p>
                            </div>
                            <button onClick={() => navigate("/settings/reset-pass")}>Reset</button>
                        </div>
                    </div>

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>Blocked Users</span>
                                <p className={styles.optionDescription}>Manage users you have blocked</p>
                            </div>
                            <button onClick={() => navigate("/blocked-users")}>View List</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
