import React, {useContext, useState} from "react";
import {
    FaProjectDiagram,
    FaUserFriends,
    FaCalendarAlt,
    FaBookmark,

    FaBars,
    FaChevronDown,
    FaChevronUp

} from "react-icons/fa";
import { FcInvite } from "react-icons/fc";
import "../styles/Sidebar.css";
import {useNavigate,Link} from "react-router-dom";
import {InvitationContext} from "../context/InvitationContext";


export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();
    const [projectsOpen, setProjectsOpen] = useState(false);
    const [friendsOpen, setFriendsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const { invitationsCount } = useContext(InvitationContext);



    return (
        <>
            <div className="sidebar-toggle" onClick={toggleSidebar}>
                <FaBars/>
            </div>

            <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
                <ul>
                    <li onClick={() => setProjectsOpen(!projectsOpen)}>
                        <FaProjectDiagram className="icon"/>
                        {isOpen && <span>My Projects</span>}
                        {isOpen && (projectsOpen ? <FaChevronUp className="chevron"/> :
                            <FaChevronDown className="chevron"/>)}
                    </li>
                    {projectsOpen && isOpen && (
                        <ul className="sublist">
                            <li>test 1</li>
                            <li>test 2</li>
                            <li>test 3</li>
                        </ul>
                    )}

                    <li onClick={() => setFriendsOpen(!friendsOpen)}>
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
                                        localStorage.clear()
                                        navigate("/findfriends");

                                    }}>
                                    Find Friends
                                </button>
                            </li>
                            <li>

                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        localStorage.clear()
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
                    <li>
                        <FaBookmark className="icon"/>
                        {isOpen && <span>Saved</span>}
                    </li>
                    <li>

                        <FcInvite className="icon" />
                        {isOpen && (
                            <Link to="/invitations" className="menu-item">
                                Invitations
                                {invitationsCount > 0  && (
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