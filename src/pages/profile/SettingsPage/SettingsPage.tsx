import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Sidebar } from "../../../components/layout";
import styles from "./SettingsPage.module.css";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "medium");
    const [language, setLanguage] = useState(i18n.language);

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
        setLanguage(lang);
        i18n.changeLanguage(lang);
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
                    <h3>{t('settings.title')}</h3>

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>{t('settings.theme')}</span>
                                <p className={styles.optionDescription}>
                                    {t('settings.themeDescription')}
                                </p>
                            </div>
                            <div>
                                <button
                                    className={theme === "dark" ? "active" : ""}
                                    onClick={() => handleThemeChange("dark")}
                                >
                                    {t('settings.dark')}
                                </button>
                                <button
                                    className={theme === "light" ? "active" : ""}
                                    onClick={() => handleThemeChange("light")}
                                >
                                    {t('settings.light')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>{t('settings.language')}</span>
                                <p className={styles.optionDescription}>{t('settings.languageDescription')}</p>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className={styles.settingsSelect}
                            >
                                <option value="en">{t('settings.english')}</option>
                                <option value="pl">{t('settings.polish')}</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>{t('settings.fontSize')}</span>
                                <p className={styles.optionDescription}>
                                    {t('settings.fontSizeDescription')}
                                </p>
                            </div>
                            <div>
                                <button
                                    className={fontSize === "small" ? "active" : ""}
                                    onClick={() => handleFontSizeChange("small")}
                                >
                                    {t('settings.small')}
                                </button>
                                <button
                                    className={fontSize === "medium" ? "active" : ""}
                                    onClick={() => handleFontSizeChange("medium")}
                                >
                                    {t('settings.medium')}
                                </button>
                                <button
                                    className={fontSize === "large" ? "active" : ""}
                                    onClick={() => handleFontSizeChange("large")}
                                >
                                    {t('settings.large')}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>{t('settings.resetPassword')}</span>
                                <p className={styles.optionDescription}>{t('settings.resetPasswordDescription')}</p>
                            </div>
                            <button onClick={() => navigate("/settings/reset-pass")}>{t('settings.reset')}</button>
                        </div>
                    </div>

                    <div className={styles.optionSection}>
                        <div className={styles.optionRow}>
                            <div className={styles.optionLabel}>
                                <span>{t('settings.blockedUsers')}</span>
                                <p className={styles.optionDescription}>{t('settings.blockedUsersDescription')}</p>
                            </div>
                            <button onClick={() => navigate("/blocked-users")}>{t('settings.viewList')}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
