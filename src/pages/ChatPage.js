import {useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";

import "../styles/MainComponents.css";
import "../styles/Chat.css"


export default function ChatPage() {
    const location = useLocation();
    const { executeQuery } = useGraphQL();
    const [selectedUser, setSelectedUser] = useState(null);
    const [popupUser, setPopupUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Check if a user was passed via navigation state
    useEffect(() => {
        if (location.state?.selectedUser) {
            setSelectedUser(location.state.selectedUser);
            // Clear the state after using it
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const data = await executeQuery(
                    GRAPHQL_QUERIES.GET_CURRENT_USER,
                    {}
                );

                if (data) {
                    setCurrentUserId(data.users.me.id);
                }
            } catch (err) {
                console.error("Failed to fetch current user:", err);
            }
        };

        fetchCurrentUser();
    }, [executeQuery]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await executeQuery(
                    GRAPHQL_QUERIES.GET_MY_FRIENDS,
                    {}
                );

                if (data) {
                    const friends = data.friendship.myfriends || [];
                    setUsers(friends.map(friend => ({
                        id: friend.id,
                        name: `${friend.name} ${friend.surname}`,
                        nickname: friend.nickname,
                        profilePic: friend.profilePic,
                        online: false // TODO: Implement online status
                    })));
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch chats:", err);
                setUsers([]);
                setLoading(false);
            }
        };

        fetchChats();
    }, []);



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
                                <ChatList users={users} onSelectUser={setSelectedUser} selectedUser={selectedUser}/>
                            )}

                            <div className="chat-window-wrapper">
                                {selectedUser ? (
                                    <ChatWindow 
                                        user={selectedUser} 
                                        currentUserId={currentUserId}
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
                    currentUserId={currentUserId}
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