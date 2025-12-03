import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem("token");
        return storedToken ? storedToken : null;
    });

    const [user, setUser] = useState(null);

    const login = (token, userData = null) => {
        setToken(token);
        localStorage.setItem("token", token);
        if (userData) {
            setUser(userData);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
