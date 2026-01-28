import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
    children: React.ReactNode;
}

/**
 * Shared authentication layout component for login and registration pages
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    const { t } = useTranslation();
    
    return (
        <div className={styles.authContainer}>
            <div className={styles.authLeft}>
                <h1 className={styles.authTitle}>{t('auth.welcomeToGroupFlow')}</h1>
                <p className={styles.authDesc}>
                    {t('auth.welcomeDescription1')}
                </p>
                <p className={styles.authDesc}>
                    {t('auth.welcomeDescription2')}
                </p>
            </div>

            <div className={styles.authRight}>{children}</div>
        </div>
    );
}

// Export styles for use by child components
export { styles as authStyles };
