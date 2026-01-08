import { useContext, useState } from "react";
import {
    FaProjectDiagram,
    FaUserFriends,
    FaComments,
    FaBookmark,
    FaBars,
    FaChevronDown,
    FaChevronUp
} from "react-icons/fa";
import "./Sidebar.css";
import { useNavigate, Link } from "react-router-dom";
import { InvitationContext } from "../../../context/InvitationContext";
import { FcInvite } from "react-icons/fc";
import { useFriends } from "../../../hooks/useFriends";
import { useMyProjects } from "../../../hooks/useProjects";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [projectsOpen, setProjectsOpen] = useState(false);
    const [friendsOpen, setFriendsOpen] = useState(false);
    const navigate = useNavigate();
    
    const { invitationsCount } = useContext(InvitationContext);
    
    // Use unified hooks with lazy loading
    const { 
        projects, 
        loading: loadingProjects, 
        refetch: fetchProjects 
    } = useMyProjects({ autoFetch: false });
    
    const { 
        friends, 
        loading: loadingFriends, 
        refetch: fetchFriends 
    } = useFriends({ autoFetch: false });

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
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
                <FaBars />
            </div>

            <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
                <ul>
                    <li onClick={handleProjectsToggle}>
                        <FaProjectDiagram className="icon" />
                        {isOpen && <span>Projects</span>}
                        {isOpen &&
                            (projectsOpen ? (
                                <FaChevronUp className="chevron" />
                            ) : (
                                <FaChevronDown className="chevron" />
                            ))}
                    </li>
                    {projectsOpen && isOpen && (
                        <ul className="sublist">
                            <li>
                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        localStorage.removeItem("projectSearchQuery");
                                        navigate("/projects");
                                    }}
                                >
                                    Find Projects
                                </button>
                            </li>
                            <li>
                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        navigate("/myprojects");
                                    }}
                                >
                                    My Projects
                                </button>
                            </li>
                            <li>
                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        navigate("/creategroup");
                                    }}
                                >
                                    Create Project
                                </button>
                            </li>
                        </ul>
                    )}

                    <li onClick={handleFriendsToggle}>
                        <FaUserFriends className="icon" />
                        {isOpen && <span>Friends</span>}
                        {isOpen &&
                            (friendsOpen ? (
                                <FaChevronUp className="chevron" />
                            ) : (
                                <FaChevronDown className="chevron" />
                            ))}
                    </li>
                    {friendsOpen && isOpen && (
                        <ul className="sublist">
                            <li>
                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        localStorage.removeItem("searchQuery");
                                        navigate("/findfriends");
                                    }}
                                >
                                    Find Friends
                                </button>
                            </li>
                            <li>
                                <button
                                    className="Friend-button"
                                    onClick={() => {
                                        localStorage.removeItem("searchQuery");
                                        navigate("/friendslist");
                                    }}
                                >
                                    Friend List
                                </button>
                            </li>
                        </ul>
                    )}

                    <li onClick={() => navigate("/chats")}>
                        <FaComments className="icon" />
                        {isOpen && <span>Chats</span>}
                    </li>
                    <li onClick={() => navigate("/Saved")}>
                        <FaBookmark className="icon" />
                        {isOpen && <span>Saved</span>}
                    </li>
                    <li>
                        <FcInvite className="icon" />
                        {isOpen && (
                            <Link to="/invitations" className="menu-item">
                                Invitations
                                {invitationsCount > 0 && <span className="notification-dot"></span>}
                            </Link>
                        )}
                    </li>
                </ul>
            </div>
        </>
    );
}
