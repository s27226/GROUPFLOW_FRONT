import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGraphQL } from "../hooks/useGraphQL";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import "../styles/CreateGroup.css";

export default function CreateGroup() {
    const navigate = useNavigate();
    const { executeQuery } = useGraphQL();
    const [projectName, setProjectName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [projectDescription, setProjectDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    // Fetch friends list
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_FRIENDS, {});
                
                if (data && data.friendship && data.friendship.myfriends) {
                    setFriends(data.friendship.myfriends);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch friends:", err);
                setFriends([]);
                setLoading(false);
            }
        };

        fetchFriends();
    }, [executeQuery]);

    const toggleUser = (user) => {
        if (selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!projectName.trim()) {
            setError("Please enter a project name.");
            return;
        }

        if (!projectDescription.trim()) {
            setError("Please enter a project description.");
            return;
        }

        setCreating(true);

        try {
            const memberIds = selectedUsers.map(u => u.id);
            
            const data = await executeQuery(GRAPHQL_MUTATIONS.CREATE_PROJECT_WITH_MEMBERS, {
                input: {
                    name: projectName,
                    description: projectDescription,
                    imageUrl: imageUrl || null,
                    isPublic: isPublic,
                    memberUserIds: memberIds
                }
            });

            if (data && data.project && data.project.createProjectWithMembers) {
                const projectId = data.project.createProjectWithMembers.id;
                // Navigate to the newly created project page
                navigate(`/project/${projectId}`);
            }
        } catch (err) {
            console.error("Failed to create project:", err);
            setError("Failed to create project. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    // Filter friends based on search term
    const filteredFriends = friends.filter(friend => {
        const fullName = `${friend.name} ${friend.surname}`.toLowerCase();
        const nickname = friend.nickname?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || nickname.includes(search);
    });

    return (
        <div className="create-group-page">
            {/* Left section - form */}
            <div className="left-section">
                <h2>Create New Project</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="create-group-form">
                    <div className="form-group">
                        <label>Project Name *</label>
                        <input
                            type="text"
                            placeholder="Enter project name..."
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            placeholder="Describe your project..."
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Image URL (Optional)</label>
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <span>Make project public</span>
                        </label>
                        <span className="form-hint">Public projects can be viewed by anyone</span>
                    </div>

                    <div className="selected-members-summary">
                        <h4>Selected Collaborators ({selectedUsers.length})</h4>
                        {selectedUsers.length === 0 ? (
                            <p className="empty-state">No collaborators selected yet</p>
                        ) : (
                            <div className="selected-chips">
                                {selectedUsers.map(user => (
                                    <div key={user.id} className="member-chip">
                                        {user.profilePic && (
                                            <img 
                                                src={user.profilePic} 
                                                alt={user.nickname} 
                                                className="chip-avatar"
                                            />
                                        )}
                                        <span>{user.nickname || `${user.name} ${user.surname}`}</span>
                                        <button
                                            type="button"
                                            className="chip-remove"
                                            onClick={() => toggleUser(user)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={creating}
                    >
                        {creating ? "Creating..." : "Create Project"}
                    </button>
                </form>
            </div>

            {/* Right section - participants */}
            <div className="right-section">
                <div className="participants-header">
                    <h3>Invite Collaborators</h3>
                    <span className="count">
                        {selectedUsers.length} / {friends.length} selected
                    </span>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search friends..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {loading ? (
                    <div className="loading-state">
                        <p>Loading friends...</p>
                    </div>
                ) : filteredFriends.length === 0 ? (
                    <div className="empty-state">
                        <p>{searchTerm ? "No friends match your search" : "You don't have any friends yet"}</p>
                    </div>
                ) : (
                    <div className="participants-list">
                        {filteredFriends.map((friend) => {
                            const isSelected = selectedUsers.some((u) => u.id === friend.id);
                            return (
                                <div 
                                    key={friend.id} 
                                    className={`participant-card ${isSelected ? "selected" : ""}`}
                                    onClick={() => toggleUser(friend)}
                                >
                                    <div className="participant-info">
                                        {friend.profilePic ? (
                                            <img 
                                                src={friend.profilePic} 
                                                alt={friend.nickname} 
                                                className="participant-avatar"
                                            />
                                        ) : (
                                            <div className="participant-avatar-placeholder">
                                                {(friend.name?.[0] || '') + (friend.surname?.[0] || '')}
                                            </div>
                                        )}
                                        <div className="participant-details">
                                            <div className="participant-name">
                                                {friend.nickname || `${friend.name} ${friend.surname}`}
                                            </div>
                                            <div className="participant-fullname">
                                                {friend.nickname && `${friend.name} ${friend.surname}`}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${isSelected ? "remove" : "add"}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleUser(friend);
                                        }}
                                    >
                                        {isSelected ? "✓" : "+"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
