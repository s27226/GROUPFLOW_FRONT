import React, {useState, useRef, useEffect} from "react";
import {Bell, MessageCircle} from "lucide-react";
import "../styles/NavBar.css";
import defaultPfp from "../images/default-pfp.png";
import logo from "../images/logo.png";
import {useAuth} from "../context/AuthContext";
import {useLocation, useNavigate} from "react-router-dom";
import {FaSearch} from "react-icons/fa";
import NotificationItem from "./NotificationItem";
import MessagePreview from "./MessagePreview";
import PrivateChat from "./PrivateChat"

function Navbar() {
    const {logout} = useAuth();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgOpen, setMsgOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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
                <span className="logo-text">NameWIP</span>
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
                            <h4>Messages</h4>
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

                <img
                    src={defaultPfp}
                    alt="User"
                    className="user-pfp"
                    onClick={() => {
                        setMenuOpen(!menuOpen);
                        setNotifOpen(false);
                        setMsgOpen(false);
                    }}
                />

                {menuOpen && (
                    <div className="dropdown-menu">
                        <button onClick={() => navigate("/profile")}>Profile</button>
                        <button onClick={() => navigate("/settings")}>Settings</button>
                        <button>Help</button>
                        <button
                            className="My Projects"
                            onClick={() => {
                                localStorage.clear()
                                navigate("/myprojects");
                                setMenuOpen(false);
                            }}>
                            My Projects
                        </button>
                        <button
                            className="Chat"
                            onClick={() => {
                                localStorage.clear()
                                navigate("/chats");
                                setMenuOpen(false);
                            }}>
                            Chats
                        </button>
                        <button
                            className="CreateGroup"
                            onClick={() => {
                                localStorage.clear()
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
