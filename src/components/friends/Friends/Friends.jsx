import { useState } from "react";
import LoadingSpinner from "../../ui/LoadingSpinner";
import ConfirmDialog from "../../ui/ConfirmDialog";
import styles from "./Friends.module.css";
import { useSearchQuery, useFriends } from "../../../hooks";
import { useNavigate } from "react-router-dom";

export default function Friends() {
    const [removeConfirm, setRemoveConfirm] = useState({ show: false, friendId: null, friendName: "" });
    const searchQuery = useSearchQuery();
    const navigate = useNavigate();
    
    // Use the unified hook for friends management
    const { friends, loading, removeFriend: removeFriendMutation, refetch } = useFriends({
        autoFetch: true,
        searchQuery
    });

    const handleRemoveFriend = async (id, name) => {
        setRemoveConfirm({ show: true, friendId: id, friendName: name });
    };

    const confirmRemoveFriend = async () => {
        const { friendId } = removeConfirm;
        setRemoveConfirm({ show: false, friendId: null, friendName: "" });

        try {
            await removeFriendMutation(friendId);
            // Hook automatically updates state
        } catch (err) {
            console.error("Failed to remove friend:", err);
        }
    };

    if (loading) {
        return (
            <div className={styles.friendsContainer}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={styles.friendsContainer}>
            <div className={styles.friendsHeader}>
                <h1>My Friends</h1>
                <div className={styles.friendsCount}>
                    {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
                </div>
            </div>

            {friends.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <h2>No friends found</h2>
                    <p>
                        {searchQuery
                            ? "Try adjusting your search"
                            : "Start by finding and adding friends!"}
                    </p>
                </div>
            ) : (
                <div className={styles.friendsGrid}>
                    {friends.map((friend) => (
                        <div className={styles.friendCard} key={friend.id}>
                            <div 
                                className={styles.friendCardHeader}
                                onClick={() => navigate(`/profile/${friend.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <img
                                    src={
                                        friend.profilePic ||
                                        `https://i.pravatar.cc/150?u=${friend.id}`
                                    }
                                    alt={friend.nickname}
                                    className={styles.friendAvatar}
                                />
                                <div className={styles.friendInfo}>
                                    <h3>{friend.nickname}</h3>
                                    <p className={styles.friendName}>
                                        {friend.name} {friend.surname}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.friendActions}>
                                <button
                                    className={styles.messageBtn}
                                    onClick={() =>
                                        navigate("/chats", {
                                            state: {
                                                selectedUser: {
                                                    id: friend.id,
                                                    name: `${friend.name} ${friend.surname}`,
                                                    nickname: friend.nickname,
                                                    image:
                                                        friend.profilePic ||
                                                        `https://i.pravatar.cc/150?u=${friend.id}`
                                                }
                                            }
                                        })
                                    }
                                >
                                    Message
                                </button>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => handleRemoveFriend(friend.id, friend.nickname || `${friend.name} ${friend.surname}`)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={removeConfirm.show}
                title="Remove Friend"
                message={`Are you sure you want to remove ${removeConfirm.friendName} from your friends?`}
                confirmText="Remove"
                cancelText="Cancel"
                danger={true}
                onConfirm={confirmRemoveFriend}
                onCancel={() => setRemoveConfirm({ show: false, friendId: null, friendName: "" })}
            />
        </div>
    );
}
