import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
    const { token } = useAuth();

    // No token, redirect
    if (!token) return <Navigate to="/login" replace />;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Token expired?
        if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Token expired");
            return <Navigate to="/login" replace />;
        }
    } catch (err) {
        console.error("Invalid token:", err);
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
