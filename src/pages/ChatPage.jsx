import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import PrivateChat from "../components/PrivateChat";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import { useFriends } from "../hooks/useFriends";
import { useAuth } from "../context/AuthContext";

import "../styles/MainComponents.css";
import "../styles/Chat.css";

export default function ChatPage() {
    const location = useLocation();
    const { user: currentUser } = useAuth();
    const [selectedUser, setSelectedUser] = useState(null);
    const [popupUser, setPopupUser] = useState(null);

    // Use unified friends hook
    const { friends, loading } = useFriends({ autoFetch: true });
    
    // Map friends to chat users format
    const users = friends.map((friend) => ({
        id: friend.id,
        name: `${friend.name} ${friend.surname}`,
        nickname: friend.nickname,
        profilePic: friend.profilePic,
        online: false // TODO: Implement online status
    }));

    // Check if a user was passed via navigation state
    useEffect(() => {
        if (location.state?.selectedUser) {
            setSelectedUser(location.state.selectedUser);
            // Clear the state after using it
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    return (
        <div className="maincomp-layout">
            <Navbar />
            <div className="maincomp-content">
                <Sidebar />
                <div className="maincomp-center-wrapper">
                    <div className="maincomp-feed-wrapper">
                        <div className="chat-layout">
                            {loading ? (
                                <p>Loading chats...</p>
                            ) : (
                                <ChatList
                                    users={users}
                                    onSelectUser={setSelectedUser}
                                    selectedUser={selectedUser}
                                />
                            )}

                            <div className="chat-window-wrapper">
                                {selectedUser ? (
                                    <ChatWindow
                                        user={selectedUser}
                                        currentUserId={currentUser?.id}
                                        onMinimize={() => {
                                            setPopupUser(selectedUser);
                                            setSelectedUser(null);
                                        }}
                                    />
                                ) : (
                                    <div className="chat-placeholder">
                                        <p>💬 Wybierz osobę, aby rozpocząć rozmowę</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {popupUser && (
                <PrivateChat
                    user={popupUser}
                    currentUserId={currentUser?.id}
                    onClose={() => setPopupUser(null)}
                    onExpand={() => {
                        setSelectedUser(popupUser);
                        setPopupUser(null);
                    }}
                />
            )}
        </div>
    );
}