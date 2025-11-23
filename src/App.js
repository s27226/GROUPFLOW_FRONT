import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectChatPage from "./pages/ProjectViewPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import MyProjectsPage from "./pages/MyProjectsPage";
import UsersPage from "./pages/UsersPage";
import FriendPage from "./pages/FriendPage";
import InvitationsPage from "./pages/InvitationsPage";
import {InvitationContext} from "./context/InvitationContext";
import {useState} from "react";

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

export default function App() {
    const [invitationsCount, setInvitationsCount] = useState(
        Number(localStorage.getItem("InvitationsCount")) || 0
    );


    return (
        <InvitationContext.Provider value={{ invitationsCount, setInvitationsCount }}>


            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/project/chat" element={<ProjectChatPage />} />
                        <Route path="/chats" element={<ChatPage />} />
                        <Route path="/creategroup" element={<CreateGroupPage />} />
                        <Route path="/myprojects" element={<MyProjectsPage />} />
                        <Route path="/findfriends" element={<UsersPage />} />
                        <Route path="/friendslist" element={<FriendPage />} />
                        <Route path="/invitations" element={<InvitationsPage />} />
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

        </InvitationContext.Provider>


    );
}