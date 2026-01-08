import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import { useToast } from "../context/ToastContext";
import { Shield, UserX, ChevronLeft, AlertCircle } from "lucide-react";
import { Navbar, Sidebar } from "../components/layout";
import "../styles/BlockedUsersPage.css";

export default function BlockedUsersPage() {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unblockingId, setUnblockingId] = useState(null);
    const { executeQuery } = useGraphQL();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const fetchBlockedUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await executeQuery(GRAPHQL_QUERIES.GET_BLOCKED_USERS, {});
            
            if (data?.blockedUser?.blockedusers) {
                setBlockedUsers(data.blockedUser.blockedusers);
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
            showToast("Failed to load blocked users", "error");
        } finally {
            setLoading(false);
        }
    }, [executeQuery, showToast]);

    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    const handleUnblock = async (userId, userName) => {
        try {
            setUnblockingId(userId);
            const response = await executeQuery(GRAPHQL_MUTATIONS.UNBLOCK_USER, {
                userIdToUnblock: userId
            });

            if (!response.errors) {
                setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
                showToast(`${userName} has been unblocked`, "success");
            } else {
                showToast("Failed to unblock user", "error");
            }
        } catch (error) {
            console.error("Error unblocking user:", error);
            showToast("An error occurred while unblocking the user", "error");
        } finally {
            setUnblockingId(null);
        }
    };

    return (
        <div className="page-layout">
            <Navbar />
            <div className="page-content">
                <Sidebar />
                <main className="blocked-users-page">
                    <div className="blocked-users-header">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </button>
                        <div className="header-title">
                            <Shield size={28} className="header-icon" />
                            <h1>Blocked Users</h1>
                        </div>
                        <p className="header-subtitle">
                            Manage users you've blocked from your account
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading blocked users...</p>
                        </div>
                    ) : blockedUsers.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <UserX size={64} strokeWidth={1.5} />
                            </div>
                            <h2>No blocked users</h2>
                            <p className="empty-description">
                                You haven't blocked anyone yet. When you block someone, you won't see their posts 
                                and they won't appear in your searches.
                            </p>
                            <div className="info-box">
                                <AlertCircle size={18} />
                                <span>You can block users from the more options menu on their posts</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="blocked-count">
                                <span>{blockedUsers.length} {blockedUsers.length === 1 ? 'user' : 'users'} blocked</span>
                            </div>
                            <div className="blocked-users-grid">
                                {blockedUsers.map(user => (
                                    <div key={user.id} className="blocked-user-card">
                                        <div className="card-content">
                                            <div className="user-avatar-wrapper">
                                                <img
                                                    src={user.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${user.nickname}`}
                                                    alt={user.nickname}
                                                    className="user-avatar"
                                                    onClick={() => navigate(`/profile/${user.id}`)}
                                                />
                                                <div className="blocked-badge">
                                                    <Shield size={14} />
                                                </div>
                                            </div>
                                            <div className="user-info">
                                                <h3
                                                    className="user-nickname"
                                                    onClick={() => navigate(`/profile/${user.id}`)}
                                                >
                                                    {user.nickname}
                                                </h3>
                                                <p className="user-name">{user.name} {user.surname}</p>
                                            </div>
                                        </div>
                                        <button
                                            className={`unblock-button ${unblockingId === user.id ? 'loading' : ''}`}
                                            onClick={() => handleUnblock(user.id, user.nickname)}
                                            disabled={unblockingId === user.id}
                                        >
                                            {unblockingId === user.id ? (
                                                <span className="button-spinner"></span>
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
