import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem("token");
        return storedToken ? storedToken : null;
    });

    const [refreshToken, setRefreshToken] = useState(() => {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        return storedRefreshToken ? storedRefreshToken : null;
    });

    const [user, setUser] = useState(null);

    const login = (accessToken, newRefreshToken, userData = null) => {
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        if (userData) {
            setUser(userData);
        }
    };

    const logout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const updateTokens = (accessToken, newRefreshToken) => {
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
    };

    return (
        <AuthContext.Provider
            value={{ token, refreshToken, user, login, logout, updateUser, updateTokens }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
