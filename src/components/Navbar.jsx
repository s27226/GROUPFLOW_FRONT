import React, {useState, useRef, useEffect} from "react";
import {Bell, MessageCircle} from "lucide-react";
import "../styles/NavBar.css";
import defaultPfp from "../images/default-pfp.png";
import logo from "../images/logo.png";
import {useAuth} from "../context/AuthContext";
import {useLocation, useNavigate} from "react-router-dom";
import {FaSearch} from "react-icons/fa";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../config/api";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import NotificationItem from "./NotificationItem";
import MessagePreview from "./MessagePreview";
import PrivateChat from "./PrivateChat"

function Navbar() {
    const { logout, user, updateUser } = useAuth();

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgOpen, setMsgOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingUser, setLoadingUser] = useState(false);

    // Fetch current user data on mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (user) return; // Already loaded
            
            setLoadingUser(true);
            try {
                const res = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_CURRENT_USER,
                        variables: {},
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (res.data.errors) {
                    console.error("Failed to fetch user:", res.data.errors[0].message);
                    return;
                }

                const userData = res.data.data.users.me;
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
    }, [user, updateUser]);
    const [activeChat, setActiveChat] = useState(null);
    const location = useLocation();
    const menuRef = useRef();

    const notifications = [
        {
            id: 1,
            icon: <Bell size={18}/>,
            text: "Alice reacted to your post",
            time: "2h ago",
            unread: true,
        },
    ];

    const messages = [
        {
            id: 1,
            image: defaultPfp,
            name: "Alice",
            lastMessage: "Men",
            time: "5m ago",
            onClick: () => {
                setActiveChat({name: "Alice", image: defaultPfp});
                setMsgOpen(false);
            },
        },
    ];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
                setNotifOpen(false);
                setMsgOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="navbar">

            <div className="navbar-logo" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
                <img src={logo} alt="Logo" className="logo-img"/>
                <span className="logo-text">GroupFlow</span>
            </div>

            <div className="search-bar-container">
                <form
                    onSubmit={(e) => {

                        console.log("Search submitted:", searchQuery);
                        localStorage.setItem("searchQuery", JSON.stringify(searchQuery));
                        // TODO: add real search logic

                        if ((location.pathname === "/") || (location.pathname === "/projects?")) {

                            navigate("/projects");
                        } else if (location.pathname === "/myprojects") {

                            navigate("/myprojects");
                        }


                    }}
                >
                    <div className="search-bar">
                        <FaSearch className="search-icon"/>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
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
                    <Bell size={24}/>

                    {notifOpen && (
                        <div className="dropdown-menu large">
                            <h4>Notifications</h4>
                            <div className="dropdown-scroll">

                                {notifications.length === 0 ? (
                                    <p>No notifications.</p>
                                ) : (
                                    notifications.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            icon={n.icon}
                                            text={n.text}
                                            time={n.time}
                                            unread={n.unread}
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
                    <MessageCircle size={24}/>

                    {msgOpen && (
                        <div className="dropdown-menu large">
                            <h4 onClick={() => navigate("/chats")} style={{cursor: "pointer"}}>Messages</h4>
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
                        src={defaultPfp}
                        alt="User"
                        className="user-pfp"
                    />
                    {user && !loadingUser && (
                        <span className="user-nickname">
                            {user.nickname}
                        </span>
                    )}
                </div>

                {menuOpen && (
                    <div className="dropdown-menu">
                        {user && (
                            <>
                                <div className="dropdown-user-info">
                                    <strong>{user.name} {user.surname}</strong>
                                    <small>{user.email}</small>
                                </div>
                                <hr/>
                            </>
                        )}
                        <button onClick={() => navigate("/profile")}>Profile</button>
                        <button onClick={() => navigate("/settings")}>Settings</button>
                        <button>Help</button>
                        <button
                            className="My Projects"
                            onClick={() => {
                                localStorage.removeItem("searchQuery");
                                navigate("/myprojects");
                                setMenuOpen(false);
                            }}>
                            My Projects
                        </button>
                        <button
                            className="Chat"
                            onClick={() => {
                                localStorage.removeItem("searchQuery");
                                navigate("/chats");
                                setMenuOpen(false);
                            }}>
                            Chats
                        </button>
                        <button
                            className="CreateGroup"
                            onClick={() => {
                                localStorage.removeItem("searchQuery");
                                navigate("/creategroup");
                                setMenuOpen(false);
                            }}>
                            Create new Group
                        </button>
                        <hr/>
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
                    <PrivateChat user={activeChat} onClose={() => setActiveChat(null)}/>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
