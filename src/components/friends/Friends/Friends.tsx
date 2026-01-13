import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../ui/LoadingSpinner";
import ConfirmDialog from "../../ui/ConfirmDialog";
import styles from "./Friends.module.css";
import { useSearchQuery, useFriends } from "../../../hooks";

interface RemoveConfirmState {
    show: boolean;
    friendId: number | null;
    friendName: string;
}

export default function Friends() {
    const { t } = useTranslation();
    const [removeConfirm, setRemoveConfirm] = useState<RemoveConfirmState>({ show: false, friendId: null, friendName: "" });
    const searchQuery = useSearchQuery();
    const navigate = useNavigate();
    
    // Use the unified hook for friends management
    const { friends, loading, removeFriend: removeFriendMutation, refetch } = useFriends({
        autoFetch: true,
        searchQuery
    });

    const handleRemoveFriend = async (id: number, name: string): Promise<void> => {
        setRemoveConfirm({ show: true, friendId: id, friendName: name });
    };

    const confirmRemoveFriend = async (): Promise<void> => {
        const { friendId } = removeConfirm;
        setRemoveConfirm({ show: false, friendId: null, friendName: "" });

        if (friendId === null) return;

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
                <h1>{t('friends.myFriends')}</h1>
                <div className={styles.friendsCount}>
                    {t('friends.friends', { count: (friends ?? []).length })}
                </div>
            </div>

            {(friends ?? []).length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <h2>{t('friends.noFriendsFound')}</h2>
                    <p>
                        {searchQuery
                            ? t('friends.tryAdjustingSearch')
                            : t('friends.startByFinding')}
                    </p>
                </div>
            ) : (
                <div className={styles.friendsGrid}>
                    {(friends ?? []).map((friend) => (
                        <div className={styles.friendCard} key={friend.id}>
                            <div 
                                className={styles.friendCardHeader}
                                onClick={() => navigate(`/profile/${friend.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <img
                                    src={
                                        friend.profilePicUrl ||
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
                                                        friend.profilePicUrl ||
                                                        `https://i.pravatar.cc/150?u=${friend.id}`
                                                }
                                            }
                                        })
                                    }
                                >
                                    {t('friends.message')}
                                </button>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => handleRemoveFriend(friend.id, friend.nickname || `${friend.name} ${friend.surname}`)}
                                >
                                    {t('friends.remove')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={removeConfirm.show}
                title={t('friends.removeFriend')}
                message={t('friends.removeFriendConfirm', { name: removeConfirm.friendName })}
                confirmText={t('friends.remove')}
                cancelText={t('common.cancel')}
                danger={true}
                onConfirm={confirmRemoveFriend}
                onCancel={() => setRemoveConfirm({ show: false, friendId: null, friendName: "" })}
            />
        </div>
    );
}
