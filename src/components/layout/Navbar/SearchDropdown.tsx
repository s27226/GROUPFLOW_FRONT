import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useMutationQuery } from "../../../hooks";
import { sanitizeText } from "../../../utils/sanitize";
import { getProfilePicUrl, getProjectImageUrl } from "../../../utils/profilePicture";
import styles from "./SearchDropdown.module.css";
import type { User } from "@/types";

interface SearchResult {
    user: User;
    isFriend?: boolean;
}

interface Project {
    id: string;
    name: string;
    imageUrl?: string;
    owner?: { name: string };
    likeCount?: number;
}

interface SearchDropdownProps {
    query: string;
    onClose: () => void;
    isOpen: boolean;
}

interface SearchUsersResponse {
    users?: {
        searchusers?: SearchResult[];
    };
}

export default function SearchDropdown({ query, onClose, isOpen }: SearchDropdownProps) {
    const navigate = useNavigate();
    
    const [users, setUsers] = useState<SearchResult[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const { mutate: searchUsers, loading } = useMutationQuery(
        GRAPHQL_QUERIES.SEARCH_USERS,
        {
            onSuccess: (data: SearchUsersResponse) => {
                const userResults = data?.users?.searchusers || [];
                setUsers(userResults.slice(0, 5));
            },
            onError: (err: Error) => {
                console.error("Failed to search users:", err);
                setUsers([]);
            }
        }
    );

    const searchAll = useCallback(async () => {
        await searchUsers({
            input: {
                searchTerm: query,
                skills: [],
                interests: []
            }
        });
        setProjects([]); // Project search not yet implemented
    }, [searchUsers, query]);

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

    const handleUserClick = (e: React.MouseEvent, userId: string): void => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        setTimeout(() => {
            navigate(`/profile/${userId}`);
        }, 0);
    };

    const handleProjectClick = (e: React.MouseEvent, projectId: string): void => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        setTimeout(() => {
            navigate(`/project/${projectId}`);
        }, 0);
    };

    const handleViewAllPeople = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        localStorage.setItem('userSearchQuery', query);
        onClose();
        setTimeout(() => {
            navigate('/findfriends');
        }, 0);
    };

    const handleViewAllProjects = (e: React.MouseEvent): void => {
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
        <div className={styles.searchDropdown}>
            {loading ? (
                <div className={styles.searchDropdownLoading}>
                    <div className={styles.spinner}></div>
                    <p>Searching...</p>
                </div>
            ) : totalResults === 0 ? (
                <div className={styles.searchDropdownEmpty}>
                    <p>No results found for "{query}"</p>
                </div>
            ) : (
                <>
                    {/* Projects Section */}
                    {projects.length > 0 && (
                        <div className={styles.searchDropdownSection}>
                            <h4 className={styles.searchDropdownHeader}>Projects</h4>
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className={`${styles.searchDropdownItem} ${styles.projectItem}`}
                                    onClick={(e) => handleProjectClick(e, project.id)}
                                >
                                    <div className={styles.projectIcon}>
                                        <img
                                            src={getProjectImageUrl(project.imageUrl, project.id, 40)}
                                            alt={project.name}
                                        />
                                    </div>
                                    <div className={styles.searchItemContent}>
                                        <div className={styles.searchItemTitle}>{sanitizeText(project.name)}</div>
                                        <div className={styles.searchItemSubtitle}>
                                            by {sanitizeText(project.owner?.name || "Unknown")}
                                        </div>
                                    </div>
                                    <div className={styles.searchItemStats}>
                                        ❤️ {project.likeCount || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* People Section */}
                    {users.length > 0 && (
                        <div className={styles.searchDropdownSection}>
                            <h4 className={styles.searchDropdownHeader}>People</h4>
                            {users.map((result) => (
                                <div
                                    key={result.user.id}
                                    className={`${styles.searchDropdownItem} ${styles.userItem}`}
                                    onClick={(e) => handleUserClick(e, String(result.user.id))}
                                >
                                    <div className={styles.userAvatar}>
                                        <img
                                            src={getProfilePicUrl(result.user.profilePicUrl, result.user.nickname)}
                                            alt={result.user.nickname}
                                        />
                                    </div>
                                    <div className={styles.searchItemContent}>
                                        <div className={styles.searchItemTitle}>
                                            {sanitizeText(result.user.name)} {sanitizeText(result.user.surname)}
                                        </div>
                                        <div className={styles.searchItemSubtitle}>
                                            @{sanitizeText(result.user.nickname)}
                                        </div>
                                    </div>
                                    {result.isFriend && (
                                        <div className={styles.searchItemBadge}>Friend</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View All Links */}
                    <div className={styles.searchDropdownFooter}>
                        <button
                            className={`${styles.searchViewAllBtn} ${styles.fullWidth}`}
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
