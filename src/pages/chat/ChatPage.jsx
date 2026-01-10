import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "../../components/layout";
import { ChatList, ChatWindow, PrivateChat } from "../../components/chat";
import { useFriends } from "../../hooks";
import { useAuth } from "../../context/AuthContext";

import styles from "./ChatPage.module.css";

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
        <Layout variant="compact" showTrending={false}>
            <div className={styles.chatLayout}>
                {loading ? (
                    <p>Loading chats...</p>
                ) : (
                    <ChatList
                        users={users}
                        onSelectUser={setSelectedUser}
                        selectedUser={selectedUser}
                    />
                )}

                <div className={styles.chatWindowWrapper}>
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
                        <div className={styles.chatPlaceholder}>
                            <p>💬 Wybierz osobę, aby rozpocząć rozmowę</p>
                        </div>
                    )}
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
        </Layout>
    );
}