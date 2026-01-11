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
                <h1 className={styles.authTitle}>Welcome to GroupFlow</h1>
                <p className={styles.authDesc}>
                    Connect, collaborate, and bring your projects to life with GroupFlow. 
                    Join a vibrant community of creators, developers, and innovators working 
                    together on exciting projects. Share ideas, find teammates, showcase your 
                    work, and build something amazing together.
                </p>
                <p className={styles.authDesc}>
                    Whether you're looking to contribute to existing projects or start your own, 
                    GroupFlow provides the perfect platform to connect with like-minded individuals 
                    and turn your vision into reality.
                </p>
            </div>

            <div className={styles.authRight}>{children}</div>
        </div>
    );
}

// Export styles for use by child components
export { styles as authStyles };
