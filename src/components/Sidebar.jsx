import React, { useState } from "react";
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

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [projectsOpen, setProjectsOpen] = useState(false);
    const [friendsOpen, setFriendsOpen] = useState(false);
    
    // Dynamic data state
    const [projects, setProjects] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingFriends, setLoadingFriends] = useState(false);

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
                        {isOpen && <span>My Projects</span>}
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
                                    <li key={project.id} title={project.description}>
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
                            {loadingFriends ? (
                                <li>Loading...</li>
                            ) : friends.length === 0 ? (
                                <li>No friends yet</li>
                            ) : (
                                friends.map((friend) => (
                                    <li key={friend.id}>
                                        {friend.nickname}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}

                    <li>
                        <FaCalendarAlt className="icon"/>
                        {isOpen && <span>Calendar</span>}
                    </li>
                    <li>
                        <FaBookmark className="icon"/>
                        {isOpen && <span>Saved</span>}
                    </li>
                    <li>
                        <FaCompass className="icon"/>
                        {isOpen && <span>Discovery</span>}
                    </li>
                </ul>
            </div>
        </>
    );
}
