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
import styles from "./Sidebar.module.css";
import { useNavigate, Link } from "react-router-dom";
import { InvitationContext } from "../../../context/InvitationContext";
import { FcInvite } from "react-icons/fc";
import { useFriends, useMyProjects } from "../../../hooks";

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
        if (!projectsOpen && (projects ?? []).length === 0) {
            fetchProjects();
        }
    };

    const handleFriendsToggle = () => {
        setFriendsOpen(!friendsOpen);
        if (!friendsOpen && (friends ?? []).length === 0) {
            fetchFriends();
        }
    };

    return (
        <>
            <div className={styles.sidebarToggle} onClick={toggleSidebar}>
                <FaBars />
            </div>

            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                <ul>
                    <li onClick={handleProjectsToggle}>
                        <FaProjectDiagram className={styles.icon} />
                        {isOpen && <span>Projects</span>}
                        {isOpen &&
                            (projectsOpen ? (
                                <FaChevronUp className={styles.chevron} />
                            ) : (
                                <FaChevronDown className={styles.chevron} />
                            ))}
                    </li>
                    {projectsOpen && isOpen && (
                        <ul className={styles.sublist}>
                            <li>
                                <button
                                    className={styles.friendButton}
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
                                    className={styles.friendButton}
                                    onClick={() => {
                                        navigate("/myprojects");
                                    }}
                                >
                                    My Projects
                                </button>
                            </li>
                            <li>
                                <button
                                    className={styles.friendButton}
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
                        <FaUserFriends className={styles.icon} />
                        {isOpen && <span>Friends</span>}
                        {isOpen &&
                            (friendsOpen ? (
                                <FaChevronUp className={styles.chevron} />
                            ) : (
                                <FaChevronDown className={styles.chevron} />
                            ))}
                    </li>
                    {friendsOpen && isOpen && (
                        <ul className={styles.sublist}>
                            <li>
                                <button
                                    className={styles.friendButton}
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
                                    className={styles.friendButton}
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
                        <FaComments className={styles.icon} />
                        {isOpen && <span>Chats</span>}
                    </li>
                    <li onClick={() => navigate("/Saved")}>
                        <FaBookmark className={styles.icon} />
                        {isOpen && <span>Saved</span>}
                    </li>
                    <li>
                        <FcInvite className={styles.icon} />
                        {isOpen && (
                            <Link to="/invitations" className={styles.menuItem}>
                                Invitations
                                {invitationsCount > 0 && <span className={styles.notificationDot}></span>}
                            </Link>
                        )}
                    </li>
                </ul>
            </div>
        </>
    );
}
