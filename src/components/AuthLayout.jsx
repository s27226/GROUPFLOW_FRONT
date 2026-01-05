import "../styles/auth.css";

/**
 * Shared authentication layout component for login and registration pages
 */
export default function AuthLayout({ children }) {
    return (
        <div className="auth-container">
            <div className="auth-left">
                <h1 className="auth-title">Welcome to the App</h1>
                <p className="auth-desc">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </div>

            <div className="auth-right">{children}</div>
        </div>
    );
}
