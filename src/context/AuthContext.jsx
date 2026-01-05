import { createContext, useContext, useState, useEffect } from "react";
import { clearAuthCookies } from "../utils/cookies";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // Initialize state without tokens since we can't read HttpOnly cookies
    const [token, setToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [isModerator, setIsModerator] = useState(() => {
        const storedIsModerator = localStorage.getItem("isModerator");
        return storedIsModerator === "true";
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            // Make a simple authenticated request to check if we're logged in
            const response = await fetch(process.env.REACT_APP_API_URL || "http://localhost:5000/api", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                        query Me {
                            __typename
                        }
                    `
                })
            });

            if (response.ok) {
                setIsAuthenticated(true);
                if (user) {
                    setToken("cookie-token");
                }
            } else {
                setIsAuthenticated(false);
                setToken(null);
                setRefreshToken(null);
            }
        } catch (error) {
            console.error("Auth status check failed:", error);
            setIsAuthenticated(false);
            setToken(null);
            setRefreshToken(null);
        }
    };

    const login = (accessToken, newRefreshToken, userData = null) => {
        // Tokens are set as HttpOnly cookies by the server
        // We just update our local state
        setToken("cookie-token"); // Placeholder
        setRefreshToken("cookie-refresh-token"); // Placeholder
        setIsAuthenticated(true);
        
        if (userData) {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            if (userData.isModerator !== undefined) {
                setIsModerator(userData.isModerator);
                localStorage.setItem("isModerator", userData.isModerator.toString());
            }
        }
    };

    const logout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsModerator(false);
        setIsAuthenticated(false);
        
        // Clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("isModerator");
        
        clearAuthCookies();
        
        fetch(process.env.REACT_APP_API_URL || "http://localhost:5000/api", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation Logout {
                        auth {
                            logout
                        }
                    }
                `
            })
        }).catch(console.error);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const updateTokens = (accessToken, newRefreshToken) => {
        // Tokens are managed by server cookies
        // Just update authentication status
        setIsAuthenticated(true);
        setToken("cookie-token"); // Placeholder
        setRefreshToken("cookie-refresh-token"); // Placeholder
    };

    return (
        <AuthContext.Provider
            value={{ 
                token, 
                refreshToken, 
                user, 
                isModerator, 
                isAuthenticated,
                login, 
                logout, 
                updateUser, 
                updateTokens,
                checkAuthStatus 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
