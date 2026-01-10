import {
    LoginPage,
    RegisterPage,
    ResetPasswordPage,
    MainPage,
    NewPostPage,
    PostPage,
    SavedPage,
    ProfilePage,
    ProfileEditPage,
    ProfileTagsPage,
    SettingsPage,
    ChatPage,
    FriendPage,
    InvitationsPage,
    ModerationPage,
    BlockedUsersPage,
    ReportedPostsPage,
    ProjectsPage,
    MyProjectsPage,
    CreateGroupPage,
    ProjectEditFrontPage,
    ProjectProfilePage,
    ProjectViewPage as ProjectChatPage,
    UsersPage
} from "./pages";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PrivateChat } from "./components/chat";
import { useState } from "react";
import { useInvitationPolling } from "./hooks";
import { InvitationContext } from "./context/InvitationContext";
import { ToastProvider } from "./context/ToastContext";

import { ChildrenProps } from "./types";

/**
 * RequireAuth - Unified authentication wrapper for protected routes
 * Handles both traditional navigation and direct URL access
 * Waits for auth check to complete before redirecting
 */
function RequireAuth({ children }: ChildrenProps): React.ReactElement | null {
    const { isAuthenticated, authLoading } = useAuth();
    const location = useLocation();

    // Return null while checking authentication (brief blank screen)
    if (authLoading) {
        return null;
    }

    // Redirect to login if not authenticated, preserving the intended destination
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

/**
 * PublicRoute - Wrapper for public-only routes (login, register)
 * Redirects authenticated users to home
 */
function PublicRoute({ children }: ChildrenProps): React.ReactElement | null {
    const { isAuthenticated, authLoading } = useAuth();
    const location = useLocation();

    // Return null while checking authentication (brief blank screen)
    if (authLoading) {
        return null;
    }

    // Redirect to intended destination or home if already authenticated
    if (isAuthenticated) {
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
}

interface AppContentProps {
    setInvitationsCount: (count: number | ((prev: number) => number)) => void;
}

function AppContent({ setInvitationsCount }: AppContentProps): React.ReactElement {
    useInvitationPolling(setInvitationsCount);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes - redirect to home if already logged in */}
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                } />
                
                {/* Protected routes - require authentication */}
                <Route path="/" element={
                    <RequireAuth>
                        <MainPage />
                    </RequireAuth>
                } />
                <Route path="/profile/:userId" element={
                    <RequireAuth>
                        <ProfilePage />
                    </RequireAuth>
                } />
                <Route path="/settings" element={
                    <RequireAuth>
                        <SettingsPage />
                    </RequireAuth>
                } />
                <Route path="/settings/reset-pass" element={
                    <RequireAuth>
                        <ResetPasswordPage />
                    </RequireAuth>
                } />
                <Route path="/profile/edit" element={
                    <RequireAuth>
                        <ProfileEditPage />
                    </RequireAuth>
                } />
                <Route path="/project/:projectId" element={
                    <RequireAuth>
                        <ProjectProfilePage />
                    </RequireAuth>
                } />
                <Route path="/project/:projectId/edit" element={
                    <RequireAuth>
                        <ProjectEditFrontPage />
                    </RequireAuth>
                } />
                <Route path="/project/:projectId/new-post" element={
                    <RequireAuth>
                        <NewPostPage />
                    </RequireAuth>
                } />
                <Route path="/new-post" element={
                    <RequireAuth>
                        <NewPostPage />
                    </RequireAuth>
                } />
                <Route path="/chat/:username" element={
                    <RequireAuth>
                        <PrivateChat />
                    </RequireAuth>
                } />
                <Route path="/projects" element={
                    <RequireAuth>
                        <ProjectsPage />
                    </RequireAuth>
                } />
                <Route path="/project/:id/workspace" element={
                    <RequireAuth>
                        <ProjectChatPage />
                    </RequireAuth>
                } />
                <Route path="/chats" element={
                    <RequireAuth>
                        <ChatPage />
                    </RequireAuth>
                } />
                <Route path="/creategroup" element={
                    <RequireAuth>
                        <CreateGroupPage />
                    </RequireAuth>
                } />
                <Route path="/myprojects" element={
                    <RequireAuth>
                        <MyProjectsPage />
                    </RequireAuth>
                } />
                <Route path="/findfriends" element={
                    <RequireAuth>
                        <UsersPage />
                    </RequireAuth>
                } />
                <Route path="/profile-tags" element={
                    <RequireAuth>
                        <ProfileTagsPage />
                    </RequireAuth>
                } />
                <Route path="/friendslist" element={
                    <RequireAuth>
                        <FriendPage />
                    </RequireAuth>
                } />
                <Route path="/invitations" element={
                    <RequireAuth>
                        <InvitationsPage />
                    </RequireAuth>
                } />
                <Route path="/blocked-users" element={
                    <RequireAuth>
                        <BlockedUsersPage />
                    </RequireAuth>
                } />
                <Route path="/admin/reported-posts" element={
                    <RequireAuth>
                        <ReportedPostsPage />
                    </RequireAuth>
                } />
                <Route path="/moderation" element={
                    <RequireAuth>
                        <ModerationPage />
                    </RequireAuth>
                } />
                <Route path="/Saved" element={
                    <RequireAuth>
                        <SavedPage />
                    </RequireAuth>
                } />
                <Route path="/post/:postId" element={
                    <RequireAuth>
                        <PostPage />
                    </RequireAuth>
                } />
                
                {/* 404 Page */}
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
