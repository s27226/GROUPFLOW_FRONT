import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import ProjectProfilePage from "./pages/ProjectProfilePage";
import ProjectEditFrontPage from "./pages/ProjectEditFrontPage";
import ProjectChatPage from "./pages/ProjectViewPage";
import ProjectsPage from "./pages/ProjectsPage";
import PrivateChat from "./components/PrivateChat";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChatPage from "./pages/ChatPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import MyProjectsPage from "./pages/MyProjectsPage";
import UsersPage from "./pages/UsersPage";
import FriendPage from "./pages/FriendPage";
import { useState } from "react";
import { useInvitationPolling } from "./hooks/useInvitationPolling";
import InvitationsPage from "./pages/InvitationsPage";
import { InvitationContext } from "./context/InvitationContext";
import NewPostPage from "./pages/NewPostPage";
import SavedPage from "./pages/SavedPage";
import PostPage from "./pages/PostPage";
import ProfileTagsPage from "./pages/ProfileTagsPage";
import { ToastProvider } from "./context/ToastContext";

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

function AppContent({ setInvitationsCount }) {
    useInvitationPolling(setInvitationsCount);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/reset-pass" element={<ResetPasswordPage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/project/:projectId" element={<ProjectProfilePage />} />
                <Route path="/project/:projectId/edit" element={<ProjectEditFrontPage />} />
                <Route path="/project/:projectId/new-post" element={<NewPostPage />} />
                <Route path="/new-post" element={<NewPostPage />} />
                <Route path="/chat/:username" element={<PrivateChat />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/project/:id/workspace" element={<ProjectChatPage />} />
                <Route path="/chats" element={<ChatPage />} />
                <Route path="/creategroup" element={<CreateGroupPage />} />
                <Route path="/myprojects" element={<MyProjectsPage />} />
                <Route path="/findfriends" element={<UsersPage />} />
                <Route path="/profile-tags" element={<ProfileTagsPage />} />
                <Route path="/friendslist" element={<FriendPage />} />
                <Route path="/invitations" element={<InvitationsPage />} />
                <Route path="/Saved" element={<SavedPage />} />
                <Route path="/post/:postId" element={<PostPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={
                        <div style={{ padding: "40px", textAlign: "center" }}>
                            <h1>404 - Page Not Found</h1>
                            <p>Sorry, this page doesn't exist.</p>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default function App() {
    const [invitationsCount, setInvitationsCount] = useState(
        Number(localStorage.getItem("InvitationsCount")) || 0
    );

    return (
        <ToastProvider>
            <InvitationContext.Provider value={{ invitationsCount, setInvitationsCount }}>
                <AuthProvider>
                    <AppContent setInvitationsCount={setInvitationsCount} />
                </AuthProvider>
            </InvitationContext.Provider>
        </ToastProvider>
    );
}
