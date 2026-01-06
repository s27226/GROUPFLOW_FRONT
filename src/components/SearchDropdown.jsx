import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import { sanitizeText } from "../utils/sanitize";
import "../styles/SearchDropdown.css";

export default function SearchDropdown({ query, onClose, isOpen }) {
    const navigate = useNavigate();
    const { executeQuery } = useGraphQL();
    
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchAll = useCallback(async () => {
        setLoading(true);
        try {
            // For now, only search users - project search will be implemented later
            const usersData = await executeQuery(GRAPHQL_QUERIES.SEARCH_USERS, {
                input: {
                    searchTerm: query,
                    skills: [],
                    interests: []
                }
            }).catch(err => {
                console.error("Failed to search users:", err);
                return null;
            });

            const userResults = usersData?.users?.searchusers || [];
            
            setUsers(userResults.slice(0, 5));
            setProjects([]); // Project search not yet implemented
        } catch (err) {
            console.error("Failed to search:", err);
            setUsers([]);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, [executeQuery, query]);

    useEffect(() => {
        if (!query.trim() || !isOpen) {
            setUsers([]);
            setProjects([]);
            return;
        }

        // Debounce search - wait 300ms after user stops typing
        const timeoutId = setTimeout(() => {
            searchAll();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, isOpen, searchAll]);

    const handleUserClick = (e, userId) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        setTimeout(() => {
            navigate(`/profile/${userId}`);
        }, 0);
    };

    const handleProjectClick = (e, projectId) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        setTimeout(() => {
            navigate(`/project/${projectId}`);
        }, 0);
    };

    const handleViewAllPeople = (e) => {
        e.preventDefault();
        e.stopPropagation();
        localStorage.setItem('userSearchQuery', query);
        onClose();
        setTimeout(() => {
            navigate('/findfriends');
        }, 0);
    };

    const handleViewAllProjects = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        setTimeout(() => {
            navigate('/projects');
        }, 0);
    };

    if (!isOpen || !query.trim()) return null;

    const totalResults = users.length + projects.length;

    return (
        <div className="search-dropdown">
            {loading ? (
                <div className="search-dropdown-loading">
                    <div className="spinner"></div>
                    <p>Searching...</p>
                </div>
            ) : totalResults === 0 ? (
                <div className="search-dropdown-empty">
                    <p>No results found for "{query}"</p>
                </div>
            ) : (
                <>
                    {/* Projects Section */}
                    {projects.length > 0 && (
                        <div className="search-dropdown-section">
                            <h4 className="search-dropdown-header">Projects</h4>
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="search-dropdown-item project-item"
                                    onClick={(e) => handleProjectClick(e, project.id)}
                                >
                                    <div className="project-icon">
                                        <img
                                            src={
                                                project.imageUrl ||
                                                `https://picsum.photos/40?random=${project.id}`
                                            }
                                            alt={project.name}
                                        />
                                    </div>
                                    <div className="search-item-content">
                                        <div className="search-item-title">{sanitizeText(project.name)}</div>
                                        <div className="search-item-subtitle">
                                            by {sanitizeText(project.owner?.name || "Unknown")}
                                        </div>
                                    </div>
                                    <div className="search-item-stats">
                                        ❤️ {project.likeCount || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* People Section */}
                    {users.length > 0 && (
                        <div className="search-dropdown-section">
                            <h4 className="search-dropdown-header">People</h4>
                            {users.map((result) => (
                                <div
                                    key={result.user.id}
                                    className="search-dropdown-item user-item"
                                    onClick={(e) => handleUserClick(e, result.user.id)}
                                >
                                    <div className="user-avatar">
                                        <img
                                            src={
                                                result.user.profilePic ||
                                                `https://api.dicebear.com/9.x/identicon/svg?seed=${result.user.nickname}`
                                            }
                                            alt={result.user.nickname}
                                        />
                                    </div>
                                    <div className="search-item-content">
                                        <div className="search-item-title">
                                            {sanitizeText(result.user.name)} {sanitizeText(result.user.surname)}
                                        </div>
                                        <div className="search-item-subtitle">
                                            @{sanitizeText(result.user.nickname)}
                                        </div>
                                    </div>
                                    {result.isFriend && (
                                        <div className="search-item-badge">Friend</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View All Links */}
                    <div className="search-dropdown-footer">
                        <button
                            className="search-view-all-btn full-width"
                            onClick={(e) => handleViewAllPeople(e)}
                        >
                            View all people
                        </button>
                        {/* Project search not yet implemented
                        <button
                            className="search-view-all-btn secondary"
                            onClick={handleViewAllProjects}
                        >
                            View all projects
                        </button>
                        */}
                    </div>
                </>
            )}
        </div>
    );
}
