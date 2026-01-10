import React from "react";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
    children: React.ReactNode;
}

/**
 * Shared authentication layout component for login and registration pages
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className={styles.authContainer}>
            <div className={styles.authLeft}>
                <h1 className={styles.authTitle}>Welcome to the App</h1>
                <p className={styles.authDesc}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </div>

            <div className={styles.authRight}>{children}</div>
        </div>
    );
}

// Export styles for use by child components
export { styles as authStyles };
