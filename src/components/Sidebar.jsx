import React, {useContext, useState} from "react";
import {
    FaProjectDiagram,
    FaUserFriends,
    FaCalendarAlt,
    FaBookmark,
    FaCompass,
    FaBars,
    FaChevronDown,
    FaChevronUp
} from "react-icons/fa";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../config/api";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import "../styles/Sidebar.css";
import {useNavigate, Link} from "react-router-dom";
import {InvitationContext} from "../context/InvitationContext";
import {FcInvite} from "react-icons/fc";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [projectsOpen, setProjectsOpen] = useState(false);
    const [friendsOpen, setFriendsOpen] = useState(false);
    const navigate = useNavigate();
    // Dynamic data state
    const [projects, setProjects] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const {invitationsCount} = useContext(InvitationContext);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const fetchProjects = async () => {
        if (projects.length > 0) return; // Don't fetch if already loaded
        
        setLoadingProjects(true);
        try {
            const res = await axios.post(
                API_CONFIG.GRAPHQL_ENDPOINT,
                {
                    query: GRAPHQL_QUERIES.GET_MY_PROJECTS,
                    variables: {},
                },
                {
                    headers: getAuthHeaders(),
                }
            );

            if (res.data.errors) {
                throw new Error(res.data.errors[0].message);
            }

            setProjects(res.data.data.project.myprojects || []);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        }
        setLoadingProjects(false);
    };

    const fetchFriends = async () => {
        if (friends.length > 0) return; // Don't fetch if already loaded
        
        setLoadingFriends(true);
        try {
            const res = await axios.post(
                API_CONFIG.GRAPHQL_ENDPOINT,
                {
                    query: GRAPHQL_QUERIES.GET_MY_FRIENDS,
                    variables: {},
                },
                {
                    headers: getAuthHeaders(),
                }
            );

            if (res.data.errors) {
                throw new Error(res.data.errors[0].message);
            }

            setFriends(res.data.data.friendship.myfriends || []);
        } catch (err) {
            console.error("Failed to fetch friends:", err);
        }
        setLoadingFriends(false);
    };

    const handleProjectsToggle = () => {
        setProjectsOpen(!projectsOpen);
        if (!projectsOpen && projects.length === 0) {
            fetchProjects();
        }
    };

    const handleFriendsToggle = () => {
        setFriendsOpen(!friendsOpen);
        if (!friendsOpen && friends.length === 0) {
            fetchFriends();
        }
    };

    return (
        <>
            <div className="sidebar-toggle" onClick={toggleSidebar}>
                <FaBars/>
            </div>

            <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
                <ul>
                    <li onClick={handleProjectsToggle}>
                        <FaProjectDiagram className="icon"/>
                        {isOpen && <span>Top Projects</span>}
                        {isOpen && (projectsOpen ? <FaChevronUp className="chevron"/> :
                            <FaChevronDown className="chevron"/>)}
                    </li>
                    {projectsOpen && isOpen && (
                        <ul className="sublist">
                            {loadingProjects ? (
                                <li>Loading...</li>
                            ) : projects.length === 0 ? (
                                <li>No projects yet</li>
                            ) : (
                                projects.map((project) => (
                                    <li key={project.id} title={project.description} onClick={() => navigate("/project/chat")}>
                                        {project.name}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}

                    <li onClick={handleFriendsToggle}>
                        <FaUserFriends className="icon"/>
                        {isOpen && <span>Friends</span>}
                        {isOpen && (friendsOpen ? <FaChevronUp className="chevron"/> :
                            <FaChevronDown className="chevron"/>)}
                    </li>
                    {friendsOpen && isOpen && (
                        <ul className="sublist">
                            <li>

                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        localStorage.removeItem("searchQuery");
                                        navigate("/findfriends");

                                    }}>
                                    Find Friends
                                </button>
                            </li>
                            <li>

                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        localStorage.removeItem("searchQuery");
                                        navigate("/friendslist");

                                    }}>
                                    Friend List
                                </button>

                            </li>

                        </ul>
                    )}

                    <li>
                        <FaCalendarAlt className="icon"/>
                        {isOpen && <span>Calendar</span>}
                    </li>
                    <li onClick={() => navigate("/Saved")}>
                        <FaBookmark className="icon"/>
                        {isOpen && <span>Saved</span>}
                    </li>
                    <li>

                        <FcInvite className="icon"/>
                        {isOpen && (
                            <Link to="/invitations" className="menu-item">
                                Invitations
                                {invitationsCount > 0 && (
                                    <span className="notification-dot">

                                    </span>
                                )}
                            </Link>)}
                    </li>
                </ul>
            </div>
        </>
    );
}
