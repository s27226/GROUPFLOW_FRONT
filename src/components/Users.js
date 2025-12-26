import { useState, useEffect } from "react";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./ui/LoadingSpinner";
import "../styles/Users.css";

export default function Users() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("search");
    const [sentRequests, setSentRequests] = useState(new Set());
    const [friends, setFriends] = useState(new Set());
    const { executeQuery, executeMutation } = useGraphQL();
    const navigate = useNavigate();

    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");

    const loadSuggestedUsers = async () => {
        setLoading(true);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_SUGGESTED_USERS, { limit: 20 });
            const results = data?.users?.suggestedusers || [];
            setSuggestedUsers(results);

            // Update sentRequests and friends state from backend data
            const pendingUserIds = results
                .filter((result) => result.hasPendingRequest)
                .map((result) => result.user.id);
            setSentRequests(new Set(pendingUserIds));

            // Note: suggestedUsers already filters out friends, but we'll set it anyway for consistency
            setFriends(new Set());
        } catch (err) {
            console.error("Failed to load suggested users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuggestedUsers();
        
        // Check if there's a search query from the navbar
        const storedQuery = localStorage.getItem('userSearchQuery');
        if (storedQuery) {
            setSearchTerm(storedQuery);
            setActiveTab("search");
            localStorage.removeItem('userSearchQuery'); // Clear it after using
            
            // Trigger search with the stored query
            setTimeout(() => {
                handleSearchWithQuery(storedQuery);
            }, 100);
        }
    }, []);

    const handleSearchWithQuery = async (query) => {
        setLoading(true);
        try {
            const input = {
                searchTerm: query || null,
                skills: selectedSkills.length > 0 ? selectedSkills : null,
                interests: selectedInterests.length > 0 ? selectedInterests : null
            };

            const data = await executeQuery(GRAPHQL_QUERIES.SEARCH_USERS, { input });
            const results = data?.users?.searchusers || [];
            setSearchResults(results);

            // Update sentRequests and friends state from backend data
            const pendingUserIds = results
                .filter((result) => result.hasPendingRequest)
                .map((result) => result.user.id);
            setSentRequests(new Set(pendingUserIds));

            const friendUserIds = results
                .filter((result) => result.isFriend)
                .map((result) => result.user.id);
            setFriends(new Set(friendUserIds));
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        await handleSearchWithQuery(searchTerm);
    };

    const addSkillFilter = () => {
        if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
            setSelectedSkills([...selectedSkills, skillInput.trim()]);
            setSkillInput("");
        }
    };

    const removeSkillFilter = (skill) => {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    };

    const addInterestFilter = () => {
        if (interestInput.trim() && !selectedInterests.includes(interestInput.trim())) {
            setSelectedInterests([...selectedInterests, interestInput.trim()]);
            setInterestInput("");
        }
    };

    const removeInterestFilter = (interest) => {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    };

    const sendFriendRequest = async (userId) => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST, { requesteeId: userId });
            setSentRequests((prev) => new Set([...prev, userId]));
        } catch (err) {
            console.error("Failed to send friend request:", err);
        }
    };

    const renderUserCard = (user, matchScore = null, matchDetails = null) => {
        const isFriend = friends.has(user.id);
        const hasPendingRequest = sentRequests.has(user.id);

        let buttonText = "Send Friend Request";
        let buttonClass = "send-request-btn";
        let isDisabled = false;

        if (isFriend) {
            buttonText = "Already Friends";
            buttonClass = "send-request-btn friends";
            isDisabled = true;
        } else if (hasPendingRequest) {
            buttonText = "Friend Request Sent";
            buttonClass = "send-request-btn request-sent";
            isDisabled = true;
        }

        return (
            <div key={user.id} className="user-card">
                <div 
                    className="user-card-header"
                    onClick={() => navigate(`/profile/${user.id}`)}
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src={user.profilePic || `https://i.pravatar.cc/80?u=${user.id}`}
                        alt={user.nickname}
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <h3>{user.nickname}</h3>
                        <p className="user-name">
                            {user.name} {user.surname}
                        </p>
                        {matchScore !== null && (
                            <p className="match-score">Match: {matchScore.toFixed(0)}%</p>
                        )}
                    </div>
                </div>

                {matchDetails && (
                    <div className="match-details">
                        <small>{matchDetails}</small>
                    </div>
                )}

                {user.skills && user.skills.length > 0 && (
                    <div className="user-tags">
                        <h4>Skills:</h4>
                        <div className="tags-list">
                            {user.skills.map((skill) => (
                                <span key={skill.id} className="tag skill-tag">
                                    {skill.skillName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {user.interests && user.interests.length > 0 && (
                    <div className="user-tags">
                        <h4>Interests:</h4>
                        <div className="tags-list">
                            {user.interests.map((interest) => (
                                <span key={interest.id} className="tag interest-tag">
                                    {interest.interestName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    className={buttonClass}
                    onClick={() => sendFriendRequest(user.id)}
                    disabled={isDisabled}
                >
                    {buttonText}
                </button>
            </div>
        );
    };

    return (
        <div className="users-container">
            <h1>Find Friends</h1>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === "search" ? "active" : ""}`}
                    onClick={() => setActiveTab("search")}
                >
                    Search
                </button>
                <button
                    className={`tab ${activeTab === "suggested" ? "active" : ""}`}
                    onClick={() => setActiveTab("suggested")}
                >
                    Suggested for You
                </button>
            </div>

            {activeTab === "search" && (
                <div className="search-section">
                    <div className="find-friends-search">
                        <input
                            type="text"
                            placeholder="Search by name or nickname..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="find-friends-input"
                        />
                        <button onClick={handleSearch} className="find-friends-btn">
                            Search
                        </button>
                    </div>

                    <div className="filters">
                        <div className="filter-group">
                            <h3>Filter by Skills</h3>
                            <div className="filter-input">
                                <input
                                    type="text"
                                    placeholder="Add skill..."
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addSkillFilter()}
                                />
                                <button onClick={addSkillFilter} className="add-filter-btn">
                                    +
                                </button>
                            </div>
                            <div className="selected-filters">
                                {selectedSkills.map((skill) => (
                                    <span key={skill} className="filter-tag skill-tag">
                                        {skill}
                                        <button onClick={() => removeSkillFilter(skill)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3>Filter by Interests</h3>
                            <div className="filter-input">
                                <input
                                    type="text"
                                    placeholder="Add interest..."
                                    value={interestInput}
                                    onChange={(e) => setInterestInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addInterestFilter()}
                                />
                                <button onClick={addInterestFilter} className="add-filter-btn">
                                    +
                                </button>
                            </div>
                            <div className="selected-filters">
                                {selectedInterests.map((interest) => (
                                    <span key={interest} className="filter-tag interest-tag">
                                        {interest}
                                        <button onClick={() => removeInterestFilter(interest)}>
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="results">
                        {loading ? (
                            <LoadingSpinner />
                        ) : searchResults.length > 0 ? (
                            <div className="user-cards">
                                {searchResults.map((result) => renderUserCard(result.user))}
                            </div>
                        ) : (
                            <p className="no-results">
                                {searchTerm ||
                                selectedSkills.length > 0 ||
                                selectedInterests.length > 0
                                    ? "No users found matching your criteria."
                                    : "Enter search criteria to find friends."}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "suggested" && (
                <div className="suggested-section">
                    <p className="suggested-description">
                        Users matched based on shared skills, interests, common projects, and recent interactions:
                    </p>
                    {loading ? (
                        <LoadingSpinner />
                    ) : suggestedUsers.length > 0 ? (
                        <div className="user-cards">
                            {suggestedUsers.map(
                                ({ user, matchScore, commonSkills, commonInterests, commonProjects, recentInteractions }) => {
                                    const details = [];
                                    if (commonSkills > 0) {
                                        details.push(`${commonSkills} common skill${commonSkills > 1 ? "s" : ""}`);
                                    }
                                    if (commonInterests > 0) {
                                        details.push(`${commonInterests} common interest${commonInterests > 1 ? "s" : ""}`);
                                    }
                                    if (commonProjects > 0) {
                                        details.push(`${commonProjects} shared project${commonProjects > 1 ? "s" : ""}`);
                                    }
                                    if (recentInteractions > 0) {
                                        details.push(`${recentInteractions} recent interaction${recentInteractions > 1 ? "s" : ""}`);
                                    }
                                    
                                    const matchDetailsText = details.length > 0 ? details.join(", ") : null;
                                    
                                    return renderUserCard(user, matchScore, matchDetailsText);
                                }
                            )}
                        </div>
                    ) : (
                        <p className="no-results">
                            No suggestions available. Add skills and interests to your profile to
                            get personalized recommendations!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
