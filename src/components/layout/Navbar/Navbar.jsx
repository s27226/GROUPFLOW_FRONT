import { useState, useEffect } from "react";
import { Bell, MessageCircle } from "lucide-react";
import "./Navbar.css";
import defaultPfp from "../../../images/default-pfp.png";
import logo from "../../../images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import NotificationItem from "./NotificationItem";
import MessagePreview from "./MessagePreview";
import SearchDropdown from "./SearchDropdown";
import PrivateChat from "../../chat/PrivateChat";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useGraphQL } from "../../../hooks/useGraphQL";
import { useFriends } from "../../../hooks/useFriends";

function Navbar() {
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
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const { executeQuery } = useGraphQL();

    // Fetch current user data on mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (user || !isAuthenticated) return; // Already loaded or not authenticated

            setLoadingUser(true);
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_CURRENT_USER, {});

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

    const [activeChat, setActiveChat] = useState(null);

    // Sync search query with URL when on search page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlQuery = params.get("q");
        if (location.pathname === "/search" && urlQuery) {
            setSearchQuery(urlQuery);
        }
    }, [location]);

    // Close all dropdowns when clicking outside
    const menuRef = useClickOutside(
        () => {
            setMenuOpen(false);
            setNotifOpen(false);
            setMsgOpen(false);
        },
        [menuOpen, notifOpen, msgOpen]
    );

    // Separate ref for search dropdown
    const searchRef = useClickOutside(
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
                });

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
    const messages = friends.slice(0, 5).map((friend) => ({
        id: friend.id,
        image: friend.profilePic || defaultPfp,
        name: `${friend.name} ${friend.surname}`,
        lastMessage: "Click to chat",
        time: "",
        onClick: () => {
            setActiveChat({
                id: friend.id,
                name: `${friend.name} ${friend.surname}`,
                nickname: friend.nickname,
                image: friend.profilePic || defaultPfp
            });
            setMsgOpen(false);
        }
    }));

    return (
        <nav className="navbar">
            <div
                className="navbar-logo"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
            >
                <img src={logo} alt="Logo" className="logo-img" />
                <span className="logo-text">GroupFlow</span>
            </div>

            <div className="search-bar-container">
                <form
                    ref={searchRef}
                    onSubmit={(e) => {
                        e.preventDefault();
                        // Just keep the dropdown open, user can click on results or links
                    }}
                >
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search projects and people..."
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

            <div className="navbar-right" ref={menuRef}>
                <div
                    className="icon-wrapper spaced"
                    onClick={() => {
                        setNotifOpen(!notifOpen);
                        setMsgOpen(false);
                        setMenuOpen(false);
                    }}
                >
                    <Bell size={24} />

                    {notifOpen && (
                        <div className="dropdown-menu large">
                            <h4>Notifications</h4>
                            <div className="dropdown-scroll">
                                {loadingNotifications ? (
                                    <p>Loading notifications...</p>
                                ) : notifications.length === 0 ? (
                                    <p>No notifications.</p>
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
                    className="icon-wrapper spaced"
                    onClick={() => {
                        setMsgOpen(!msgOpen);
                        setNotifOpen(false);
                        setMenuOpen(false);
                    }}
                >
                    <MessageCircle size={24} />

                    {msgOpen && (
                        <div className="dropdown-menu large">
                            <h4 onClick={() => navigate("/chats")} style={{ cursor: "pointer" }}>
                                Messages
                            </h4>
                            <div className="dropdown-scroll">
                                {messages.length === 0 ? (
                                    <p>No messages.</p>
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
                    className="user-info-wrapper"
                    onClick={() => {
                        setMenuOpen(!menuOpen);
                        setNotifOpen(false);
                        setMsgOpen(false);
                    }}
                >
                    <img 
                        src={user?.profilePic || defaultPfp} 
                        alt="User" 
                        className="user-pfp" 
                    />
                    {user && !loadingUser && <span className="user-nickname">{user.nickname}</span>}
                </div>

                {menuOpen && (
                    <div className="dropdown-menu">
                        {user && (
                            <>
                                <div className="dropdown-user-info">
                                    <strong>
                                        {user.name} {user.surname}
                                    </strong>
                                    <small>{user.email}</small>
                                </div>
                                <hr />
                            </>
                        )}
                        <button onClick={() => navigate(`/profile/${user?.id}`)}>Profile</button>
                        <button onClick={() => navigate("/profile-tags")}>
                            My Skills & Interests
                        </button>
                        <button onClick={() => navigate("/settings")}>Settings</button>
                        {isModerator && (
                            <>
                                <button onClick={() => navigate("/admin/reported-posts")}>
                                    Reported Posts (Moderator)
                                </button>
                                <button onClick={() => {
                                    navigate("/moderation");
                                }}>
                                    User Moderation
                                </button>
                            </>
                        )}
                        <button>Help</button>
                        <button
                            className="CreateGroup"
                            onClick={() => {
                                localStorage.removeItem("searchQuery");
                                navigate("/creategroup");
                                setMenuOpen(false);
                            }}
                        >
                            Create new Group
                        </button>
                        <hr />
                        <button
                            className="logout"
                            onClick={() => {
                                logout();
                                navigate("/login");
                                setMenuOpen(false);
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                )}
                {activeChat && (
                    <PrivateChat
                        user={activeChat}
                        currentUserId={user?.id}
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
