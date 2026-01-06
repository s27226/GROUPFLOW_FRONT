import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // User state stored in localStorage for UI purposes
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
            // The JWT token is automatically sent via HTTP-only cookie
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
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Auth status check failed:", error);
            setIsAuthenticated(false);
        }
    };

    const login = (userData) => {
        // JWT token is automatically set as HTTP-only cookie by the server
        // We only need to update user data and authentication state
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
        setUser(null);
        setIsModerator(false);
        setIsAuthenticated(false);
        
        // Clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("isModerator");
        
        // Call logout mutation to clear HTTP-only cookie on server
        fetch(process.env.REACT_APP_API_URL || "http://localhost:5000/api", {
            method: "POST",
            credentials: "include", // Important: sends cookies with request
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

    return (
        <AuthContext.Provider
            value={{ 
                user, 
                isModerator, 
                isAuthenticated,
                login, 
                logout, 
                updateUser,
                checkAuthStatus 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
