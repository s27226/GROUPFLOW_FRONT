import { useState, useEffect } from "react";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useGraphQL } from "../../../hooks/useGraphQL";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../ui/LoadingSpinner";
import "./Projects.css";

export default function Projects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { executeQuery } = useGraphQL();
    const navigate = useNavigate();

    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");

    useEffect(() => {
        // Check if there's a search query from the navbar
        const storedQuery = localStorage.getItem('projectSearchQuery');
        if (storedQuery) {
            setSearchTerm(storedQuery);
            localStorage.removeItem('projectSearchQuery'); // Clear it after using
            
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

            const data = await executeQuery(GRAPHQL_QUERIES.SEARCH_PROJECTS, { input });
            const results = data?.project?.searchprojects || [];
            setSearchResults(results);
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

    const renderProjectCard = (project) => {
        return (
            <div key={project.id} className="user-card">
                <div 
                    className="user-card-header"
                    onClick={() => navigate(`/project/${project.id}`)}
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src={project.imageUrl || `https://picsum.photos/80?random=${project.id}`}
                        alt={project.name}
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <h3>{project.name}</h3>
                        <p className="user-name">
                            by {project.owner.nickname || project.owner.name}
                        </p>
                        <p className="project-description">{project.description}</p>
                    </div>
                </div>

                {project.skills && project.skills.length > 0 && (
                    <div className="user-tags">
                        <h4>Skills:</h4>
                        <div className="tags-list">
                            {project.skills.map((skill) => (
                                <span key={skill.id} className="tag skill-tag">
                                    {skill.skillName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {project.interests && project.interests.length > 0 && (
                    <div className="user-tags">
                        <h4>Interests:</h4>
                        <div className="tags-list">
                            {project.interests.map((interest) => (
                                <span key={interest.id} className="tag interest-tag">
                                    {interest.interestName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="project-stats">
                    <span>👁️ {project.views?.length || 0} views</span>
                    <span> ❤️ {project.likes?.length || 0} likes</span>
                </div>
            </div>
        );
    };

    return (
        <div className="users-container">
            <h1>Find Projects</h1>

            <div className="search-section">
                <div className="find-friends-search">
                    <input
                        type="text"
                        placeholder="Search by project name or description..."
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
                            {searchResults.map((project) => renderProjectCard(project))}
                        </div>
                    ) : (
                        <p className="no-results">
                            {searchTerm ||
                            selectedSkills.length > 0 ||
                            selectedInterests.length > 0
                                ? "No projects found matching your criteria."
                                : "Enter search criteria to find projects."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
