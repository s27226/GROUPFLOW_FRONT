import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { Shield, UserX, ChevronLeft, AlertCircle } from "lucide-react";
import { Navbar, Sidebar } from "../../../components/layout";
import { getProfilePicUrl } from "../../../utils/profilePicture";
import styles from "./BlockedUsersPage.module.css";

interface BlockedUser {
    id: string;
    nickname: string;
    name: string;
    surname: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface BlockedUsersResponse {
    blockedUser?: {
        blockedusers?: BlockedUser[];
    };
}

export default function BlockedUsersPage() {
    const [unblockingId, setUnblockingId] = useState<string | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const { data: blockedUsers, loading, setData: setBlockedUsers } = useQuery<BlockedUser[]>(
        GRAPHQL_QUERIES.GET_BLOCKED_USERS,
        {},
        {
            transform: (data: unknown) => {
                const typedData = data as BlockedUsersResponse | null;
                return typedData?.blockedUser?.blockedusers || [];
            },
            initialData: [],
            onError: () => showToast("Failed to load blocked users", "error")
        }
    );

    const { execute: unblockUser } = useMutationQuery({
        onError: () => showToast("An error occurred while unblocking the user", "error")
    });

    const handleUnblock = async (userId: string, userName: string) => {
        setUnblockingId(userId);
        try {
            const response = await unblockUser(GRAPHQL_MUTATIONS.UNBLOCK_USER, {
                userIdToUnblock: userId
            }) as { errors?: unknown[] } | null;

            if (!response?.errors) {
                setBlockedUsers((blockedUsers ?? []).filter(user => user.id !== userId));
                showToast(`${userName} has been unblocked`, "success");
            } else {
                showToast("Failed to unblock user", "error");
            }
        } finally {
            setUnblockingId(null);
        }
    };

    return (
        <div className={styles.pageLayout}>
            <Navbar />
            <div className={styles.pageContent}>
                <Sidebar />
                <main className={styles.blockedUsersPage}>
                    <div className={styles.blockedUsersHeader}>
                        <button className={styles.backButton} onClick={() => navigate(-1)}>
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </button>
                        <div className={styles.headerTitle}>
                            <Shield size={28} className={styles.headerIcon} />
                            <h1>Blocked Users</h1>
                        </div>
                        <p className={styles.headerSubtitle}>
                            Manage users you've blocked from your account
                        </p>
                    </div>

                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p>Loading blocked users...</p>
                        </div>
                    ) : (blockedUsers ?? []).length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <UserX size={64} strokeWidth={1.5} />
                            </div>
                            <h2>No blocked users</h2>
                            <p className={styles.emptyDescription}>
                                You haven't blocked anyone yet. When you block someone, you won't see their posts 
                                and they won't appear in your searches.
                            </p>
                            <div className={styles.infoBox}>
                                <AlertCircle size={18} />
                                <span>You can block users from the more options menu on their posts</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.blockedCount}>
                                <span>{(blockedUsers ?? []).length} {(blockedUsers ?? []).length === 1 ? 'user' : 'users'} blocked</span>
                            </div>
                            <div className={styles.blockedUsersGrid}>
                                {(blockedUsers ?? []).map(user => (
                                    <div key={user.id} className={styles.blockedUserCard}>
                                        <div className={styles.cardContent}>
                                            <div className={styles.userAvatarWrapper}>
                                                <img
                                                    src={getProfilePicUrl(user.profilePicUrl, user.nickname)}
                                                    alt={user.nickname}
                                                    className={styles.userAvatar}
                                                    onClick={() => navigate(`/profile/${user.id}`)}
                                                />
                                                <div className={styles.blockedBadge}>
                                                    <Shield size={14} />
                                                </div>
                                            </div>
                                            <div className={styles.userInfo}>
                                                <h3
                                                    className={styles.userNickname}
                                                    onClick={() => navigate(`/profile/${user.id}`)}
                                                >
                                                    {user.nickname}
                                                </h3>
                                                <p className={styles.userName}>{user.name} {user.surname}</p>
                                            </div>
                                        </div>
                                        <button
                                            className={`${styles.unblockButton} ${unblockingId === user.id ? styles.loading : ''}`}
                                            onClick={() => handleUnblock(user.id, user.nickname)}
                                            disabled={unblockingId === user.id}
                                        >
                                            {unblockingId === user.id ? (
                                                <span className={styles.buttonSpinner}></span>
                                            ) : (
                                                <>
                                                    <UserX size={18} />
                                                    <span>Unblock</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
