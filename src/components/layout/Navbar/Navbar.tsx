import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, MessageCircle } from "lucide-react";
import styles from "./Navbar.module.css";
import logo from "../../../images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import NotificationItem from "./NotificationItem";
import MessagePreview from "./MessagePreview";
import SearchDropdown from "./SearchDropdown";
import PrivateChat from "../../chat/PrivateChat";
import { useClickOutside, useGraphQL, useFriends } from "../../../hooks";
import { getProfilePicUrl } from "../../../utils/profilePicture";

interface ActiveChatUser {
    id: number;
    name: string;
    nickname?: string;
    image: string;
}

interface NotificationData {
    id: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    actorUser?: {
        id: string;
        nickname: string;
        profilePic?: string;
    };
}

interface CurrentUserResponse {
    users: {
        me: {
            id: number;
            name?: string;
            surname?: string;
            nickname: string;
            email?: string;
            profilePic?: string;
            profilePicUrl?: string;
            isModerator?: boolean;
        };
    };
}

interface NotificationsResponse {
    notification: {
        myNotifications: NotificationData[];
    };
}

function Navbar() {
    const { t } = useTranslation();
    const { logout, user, updateUser, isAuthenticated, isModerator } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgOpen, setMsgOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    
    // Use unified friends hook
    const { friends, loading: loadingFriends } = useFriends({ 
        autoFetch: !!(isAuthenticated && user) 
    });
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const { executeQuery } = useGraphQL();

    // Fetch current user data on mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (!isAuthenticated) return; // Not authenticated
            
            // Fetch if user doesn't exist OR if we haven't fetched profile data yet
            // Note: 'profilePicUrl' in user means we've already fetched extended data
            if (user && 'profilePicUrl' in user) return; // Already have full data

            setLoadingUser(true);
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_CURRENT_USER, {}) as CurrentUserResponse;

                const userData = data.users.me;
                if (userData) {
                    updateUser(userData);
                }
            } catch (err) {
                console.error("Failed to fetch current user:", err);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchCurrentUser();
    }, [user, updateUser, executeQuery, isAuthenticated]);

    const [activeChat, setActiveChat] = useState<ActiveChatUser | null>(null);

    // Sync search query with URL when on search page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlQuery = params.get("q");
        if (location.pathname === "/search" && urlQuery) {
            setSearchQuery(urlQuery);
        }
    }, [location]);

    // Close all dropdowns when clicking outside
    const menuRef = useClickOutside<HTMLDivElement>(
        () => {
            setMenuOpen(false);
            setNotifOpen(false);
            setMsgOpen(false);
        },
        menuOpen || notifOpen || msgOpen
    );

    // Separate ref for search dropdown
    const searchRef = useClickOutside<HTMLFormElement>(
        () => {
            setSearchDropdownOpen(false);
        },
        searchDropdownOpen
    );

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!isAuthenticated || !user) return;

            setLoadingNotifications(true);
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_NOTIFICATIONS, {
                    limit: 5
                }) as NotificationsResponse;

                const notificationsList = data.notification.myNotifications || [];
                setNotifications(notificationsList);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoadingNotifications(false);
            }
        };

        fetchNotifications();
    }, [user, executeQuery, isAuthenticated, notifOpen]); // Re-fetch when notification dropdown is opened

    // Convert friends to message format
    const messages = (friends ?? []).slice(0, 5).map((friend) => ({
        id: friend.id,
        image: getProfilePicUrl(friend.profilePicUrl, friend.nickname),
        name: `${friend.name} ${friend.surname}`,
        lastMessage: t('navigation.clickToChat'),
        time: "",
        onClick: () => {
            setActiveChat({
                id: friend.id,
                name: `${friend.name} ${friend.surname}`,
                nickname: friend.nickname,
                image: getProfilePicUrl(friend.profilePicUrl, friend.nickname)
            });
            setMsgOpen(false);
        }
    }));

    return (
        <nav className={styles.navbar}>
            <div
                className={styles.navbarLogo}
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
            >
                <img src={logo} alt="Logo" className={styles.logoImg} />
                <span className={styles.logoText}>{t('navigation.groupFlow')}</span>
            </div>

            <div className={styles.searchBarContainer}>
                <form
                    ref={searchRef}
                    onSubmit={(e) => {
                        e.preventDefault();
                        // Just keep the dropdown open, user can click on results or links
                    }}
                >
                    <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={t('navigation.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSearchDropdownOpen(e.target.value.trim().length > 0);
                                if (e.target.value.trim().length > 0) {
                                    setMenuOpen(false);
                                    setNotifOpen(false);
                                    setMsgOpen(false);
                                }
                            }}
                            onFocus={() => {
                                if (searchQuery.trim()) {
                                    setSearchDropdownOpen(true);
                                    setMenuOpen(false);
                                    setNotifOpen(false);
                                    setMsgOpen(false);
                                }
                            }}
                        />
                    </div>
                    <SearchDropdown
                        query={searchQuery}
                        isOpen={searchDropdownOpen}
                        onClose={() => {
                            setSearchDropdownOpen(false);
                        }}
                    />
                </form>
            </div>

            <div className={styles.navbarRight} ref={menuRef}>
                <div
                    className={`${styles.iconWrapper} ${styles.spaced}`}
                    onClick={() => {
                        setNotifOpen(!notifOpen);
                        setMsgOpen(false);
                        setMenuOpen(false);
                    }}
                >
                    <Bell size={24} />

                    {notifOpen && (
                        <div className={`${styles.dropdownMenu} ${styles.large}`}>
                            <h4>{t('navigation.notifications')}</h4>
                            <div className={styles.dropdownScroll}>
                                {loadingNotifications ? (
                                    <p>{t('common.loading')}</p>
                                ) : notifications.length === 0 ? (
                                    <p>{t('navigation.noNotifications')}</p>
                                ) : (
                                    notifications.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className={`${styles.iconWrapper} ${styles.spaced}`}
                    onClick={() => {
                        setMsgOpen(!msgOpen);
                        setNotifOpen(false);
                        setMenuOpen(false);
                    }}
                >
                    <MessageCircle size={24} />

                    {msgOpen && (
                        <div className={`${styles.dropdownMenu} ${styles.large}`}>
                            <h4 onClick={() => navigate("/chats")} style={{ cursor: "pointer" }}>
                                {t('navigation.messages')}
                            </h4>
                            <div className={styles.dropdownScroll}>
                                {messages.length === 0 ? (
                                    <p>{t('navigation.noMessages')}</p>
                                ) : (
                                    messages.map((m) => (
                                        <MessagePreview
                                            key={m.id}
                                            image={m.image}
                                            name={m.name}
                                            lastMessage={m.lastMessage}
                                            time={m.time}
                                            onClick={m.onClick}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className={styles.userInfoWrapper}
                    onClick={() => {
                        setMenuOpen(!menuOpen);
                        setNotifOpen(false);
                        setMsgOpen(false);
                    }}
                >
                    <img 
                        src={getProfilePicUrl(user?.profilePicUrl, user?.nickname)} 
                        alt="User" 
                        className={styles.userPfp} 
                    />
                    {user && !loadingUser && <span className={styles.userNickname}>{user.nickname}</span>}
                </div>

                {menuOpen && (
                    <div className={styles.dropdownMenu}>
                        {user && (
                            <>
                                <div className={styles.dropdownUserInfo}>
                                    <strong>
                                        {user.name} {user.surname}
                                    </strong>
                                    <small>{user.email}</small>
                                </div>
                                <hr />
                            </>
                        )}
                        <button onClick={() => navigate(`/profile/${user?.id}`)}>{t('navigation.profile')}</button>
                        <button onClick={() => navigate("/profile-tags")}>
                            {t('navigation.mySkillsAndInterests')}
                        </button>
                        <button onClick={() => navigate("/settings")}>{t('navigation.settings')}</button>
                        {isModerator && (
                            <>
                                <button onClick={() => navigate("/admin/reported-posts")}>
                                    {t('navigation.reportedPosts')}
                                </button>
                                <button onClick={() => {
                                    navigate("/moderation");
                                }}>
                                    {t('navigation.userModeration')}
                                </button>
                            </>
                        )}
                        <button onClick={() => navigate("/help")}>{t('navigation.help')}</button>
                        <button
                            className="CreateGroup"
                            onClick={() => {
                                localStorage.removeItem("searchQuery");
                                navigate("/creategroup");
                                setMenuOpen(false);
                            }}
                        >
                            {t('navigation.createNewGroup')}
                        </button>
                        <hr />
                        <button
                            className={styles.logout}
                            onClick={() => {
                                logout();
                                navigate("/login");
                                setMenuOpen(false);
                            }}
                        >
                            {t('auth.logout')}
                        </button>
                    </div>
                )}
                {activeChat && (
                    <PrivateChat
                        user={activeChat}
                        currentUserId={user?.id ?? null}
                        onClose={() => setActiveChat(null)}
                        onExpand={() => {
                            navigate("/chats", { state: { selectedUser: activeChat } });
                            setActiveChat(null);
                        }}
                    />
                )}
            </div>
        </nav>
    );
}

export default Navbar;
