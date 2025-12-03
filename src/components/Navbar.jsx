import React, { useState, useRef, useEffect } from "react";
import { Bell, MessageCircle } from "lucide-react";
import "../styles/NavBar.css";
import defaultPfp from "../images/default-pfp.png";
import logo from "../images/logo.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../config/api";
import { GRAPHQL_QUERIES } from "../queries/graphql";

function Navbar() {
    const { logout, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgOpen, setMsgOpen] = useState(false);
    const menuRef = useRef();
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
            <div className="navbar-logo" onClick={() => (window.location.href = "/main")}>
                <img src={logo} alt="Logo" className="logo-img"/>
                <span className="logo-text">NameWIP</span>
            </div>

            <div className="search-bar-container">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log("Search submitted:", searchQuery);
                        // TODO: add real search logic
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
                                <p>You have no new notifications.</p>
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
                                <p>No new messages.</p>
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
                        <button>Profile</button>
                        <button>Settings</button>
                        <button>Help</button>
                        <hr/>
                        <button
                            className="logout"
                            onClick={() => {
                                logout();
                                navigate("/login");
                                setMenuOpen(false);
                            }}>
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
