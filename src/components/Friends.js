import React, {useState, useEffect} from "react";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import LoadingSpinner from "./ui/LoadingSpinner";
import "../styles/Friends.css";
import { useSearchQuery } from "../hooks/useSearchQuery";
import { useGraphQL } from "../hooks/useGraphQL";
import { useNavigate } from "react-router-dom";

export default function Friends() {
    const [friends, setFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchQuery = useSearchQuery();
    const { executeQuery, executeMutation } = useGraphQL();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            setLoading(true);
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_FRIENDS, {});

                const friendsData = data.friendship.myfriends || [];
                setFriends(friendsData);
                
                // Apply search filter
                if (searchQuery) {
                    const filtered = friendsData.filter(friend =>
                        `${friend.name} ${friend.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setFilteredFriends(filtered);
                } else {
                    setFilteredFriends(friendsData);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch friends:", err);
                setFriends([]);
                setFilteredFriends([]);
                setLoading(false);
            }
        };

        fetchFriends();
    }, [searchQuery, executeQuery]);

    const removeFriend = async (id) => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.REMOVE_FRIEND, { friendId: id });
            const updated = filteredFriends.filter(friend => friend.id !== id);
            setFilteredFriends(updated);
            setFriends(friends.filter(friend => friend.id !== id));
        } catch (err) {
            console.error("Failed to remove friend:", err);
        }
    };

    if (loading) {
        return (
            <div className="friends-container">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="friends-container">
            <div className="friends-header">
                <h1>My Friends</h1>
                <div className="friends-count">
                    {filteredFriends.length} {filteredFriends.length === 1 ? 'Friend' : 'Friends'}
                </div>
            </div>

            {filteredFriends.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h2>No friends found</h2>
                    <p>
                        {searchQuery 
                            ? "Try adjusting your search" 
                            : "Start by finding and adding friends!"}
                    </p>
                </div>
            ) : (
                <div className="friends-grid">
                    {filteredFriends.map((friend) => (
                        <div className="friend-card" key={friend.id}>
                            <div className="friend-card-header">
                                <img 
                                    src={friend.profilePic || `https://i.pravatar.cc/150?u=${friend.id}`} 
                                    alt={friend.nickname} 
                                    className="friend-avatar"
                                />
                                <div className="friend-info">
                                    <h3>{friend.nickname}</h3>
                                    <p className="friend-name">{friend.name} {friend.surname}</p>
                                </div>
                            </div>
                            
                            <div className="friend-actions">
                                <button 
                                    className="message-btn"
                                    onClick={() => navigate('/chats', { 
                                        state: { 
                                            selectedUser: {
                                                id: friend.id,
                                                name: `${friend.name} ${friend.surname}`,
                                                nickname: friend.nickname,
                                                image: friend.profilePic || `https://i.pravatar.cc/150?u=${friend.id}`
                                            }
                                        } 
                                    })}
                                >
                                    Message
                                </button>
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeFriend(friend.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}