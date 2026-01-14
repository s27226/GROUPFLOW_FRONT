import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

interface User {
    id: number;
    name?: string;
    surname?: string;
    nickname: string;
    email?: string;
    profilePicUrl?: string;
    isModerator?: boolean;
}

interface AuthContextType {
    user: User | null;
    isModerator: boolean;
    isAuthenticated: boolean;
    authLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
    checkAuthStatus: () => Promise<boolean>;
    refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    const [isModerator, setIsModerator] = useState(() => {
        const storedIsModerator = localStorage.getItem("isModerator");
        return storedIsModerator === "true";
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true); // Track initial auth check
    const isRefreshing = useRef(false); // Prevent multiple refresh attempts
    const refreshPromise = useRef<Promise<boolean> | null>(null); // Store the current refresh promise

    // Try to refresh the access token using refresh token
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        // If already refreshing, wait for the existing refresh to complete
        if (isRefreshing.current && refreshPromise.current) {
            return refreshPromise.current;
        }

        isRefreshing.current = true;
        
        refreshPromise.current = (async () => {
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        query: `
                            mutation RefreshToken {
                                auth {
                                    refreshToken {
                                        id
                                        name
                                        surname
                                        nickname
                                        email
                                        profilePicUrl
                                        isModerator
                                    }
                                }
                            }
                        `
                    })
                });

                const data = await response.json();

                if (data.errors) {
                    const errorCode = data.errors[0]?.extensions?.code;
                    const errorMessage = data.errors[0]?.message;
                    
                    // If refresh token is invalid/expired, clear session completely
                    if (errorCode === "INVALID_TOKEN" || 
                        errorCode === "INVALID_TOKEN_TYPE" || 
                        errorCode === "NO_REFRESH_TOKEN" ||
                        errorCode === "TOKEN_EXPIRED" ||
                        errorMessage?.includes("Invalid token")) {
                        // Call logout to clear server-side cookies
                        await fetch(API_URL, {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                query: `mutation Logout { auth { logout } }`
                            })
                        }).catch(() => {}); // Ignore logout errors
                    }
                    
                    throw new Error(errorMessage || "Failed to refresh token");
                }

                const authData = data.data?.auth?.refreshToken;
                
                if (authData?.id) {
                    // Update user data with refreshed info
                    const userData = {
                        id: authData.id,
                        name: authData.name,
                        surname: authData.surname,
                        nickname: authData.nickname,
                        email: authData.email,
                        profilePicUrl: authData.profilePicUrl,
                        isModerator: authData.isModerator
                    };
                    setUser(userData);
                    if (authData.isModerator !== undefined) {
                        setIsModerator(authData.isModerator);
                        localStorage.setItem("isModerator", authData.isModerator.toString());
                    }
                    setIsAuthenticated(true);
                    return true;
                }

                return false;
            } catch (error) {
                console.error("Token refresh failed:", error);
                return false;
            } finally {
                isRefreshing.current = false;
                refreshPromise.current = null;
            }
        })();
        
        return refreshPromise.current;
    }, []);

    // Check authentication status - tries access token first, then refresh token
    const checkAuthStatus = useCallback(async () => {
        try {
            // Make a simple authenticated request to check if access token is valid
            const response = await fetch(API_URL, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                        query Me {
                            users {
                                me {
                                    id
                                    nickname
                                    isModerator
                                }
                            }
                        }
                    `
                })
            });

            const data = await response.json();
            
            interface GraphQLError {
                extensions?: { code?: string };
                message?: string;
            }
            
            // Check for GraphQL authentication errors
            const hasAuthError = data.errors?.some((err: GraphQLError) => 
                err.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
                err.message?.toLowerCase().includes("unauthorized") ||
                err.message?.toLowerCase().includes("not authenticated")
            );
            
            // Check if access token is valid (no errors and has user data)
            if (!hasAuthError && data.data?.users?.me) {
                setIsAuthenticated(true);
                // Update moderator status if it changed
                if (data.data.users.me.isModerator !== undefined) {
                    setIsModerator(data.data.users.me.isModerator);
                    localStorage.setItem("isModerator", data.data.users.me.isModerator.toString());
                }
                setAuthLoading(false);
                return true;
            }

            // Access token expired or invalid - try refresh token
            const refreshed = await refreshAccessToken();
            
            if (refreshed) {
                // After successful refresh, we're authenticated
                setIsAuthenticated(true);
                setAuthLoading(false);
                return true;
            }

            // Both tokens failed - clear session
            setIsAuthenticated(false);
            setUser(null);
            setIsModerator(false);
            localStorage.removeItem("isModerator");
            setAuthLoading(false);
            return false;
        } catch (error) {
            console.error("Auth status check failed:", error);
            
            // Try refresh on network error too
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                setIsAuthenticated(true);
                setAuthLoading(false);
                return true;
            }

            setIsAuthenticated(false);
            setUser(null);
            setIsModerator(false);
            localStorage.removeItem("isModerator");
            setAuthLoading(false);
            return false;
        }
    }, [refreshAccessToken]);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = (userData: User) => {
        // JWT token is automatically set as HTTP-only cookie by the server
        // We only need to update user data and authentication state
        setIsAuthenticated(true);
        
        if (userData) {
            setUser(userData);
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
        localStorage.removeItem("isModerator");
        
        // Call logout mutation to clear HTTP-only cookie on server
        fetch(API_URL, {
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

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider
            value={{ 
                user, 
                isModerator, 
                isAuthenticated,
                authLoading,
                login, 
                logout, 
                updateUser,
                checkAuthStatus,
                refreshAccessToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
