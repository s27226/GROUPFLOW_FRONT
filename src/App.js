import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ProfileEditPage from "./pages/ProfileEditPage"
import ProjectProfilePage from "./pages/ProjectProfilePage"
import ProjectEditFrontPage from "./pages/ProjectEditFrontPage"
import PrivateChat from "./components/PrivateChat";
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile/edit" element={<ProfileEditPage />} />
                    <Route path="/project" element={<ProjectProfilePage />} />
                    <Route path="/project/edit" element={<ProjectEditFrontPage />} />
                    <Route path="/chat/:username" element={<PrivateChat />} />
                    <Route
                        path="/"
                        element={
                            //<ProtectedRoute>
                                <MainPage />
                            //</ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}