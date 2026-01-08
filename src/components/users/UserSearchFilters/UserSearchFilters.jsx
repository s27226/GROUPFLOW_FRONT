/**
 * User search filters component with skill and interest filtering
 */
export default function UserSearchFilters({
    searchTerm,
    setSearchTerm,
    skillInput,
    setSkillInput,
    interestInput,
    setInterestInput,
    selectedSkills,
    selectedInterests,
    onSearch,
    onAddSkill,
    onRemoveSkill,
    onAddInterest,
    onRemoveInterest
}) {
    const handleKeyDown = (e, action) => {
        if (e.key === "Enter") {
            action();
        }
    };

    return (
        <div className="search-section">
            <div className="find-friends-search">
                <input
                    type="text"
                    placeholder="Search by name or nickname..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, onSearch)}
                    className="find-friends-input"
                />
                <button onClick={onSearch} className="find-friends-btn">
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
                            onKeyDown={(e) => handleKeyDown(e, onAddSkill)}
                        />
                        <button onClick={onAddSkill} className="add-filter-btn">
                            +
                        </button>
                    </div>
                    <div className="selected-filters">
                        {selectedSkills.map((skill) => (
                            <span key={skill} className="filter-tag skill-tag">
                                {skill}
                                <button onClick={() => onRemoveSkill(skill)}>×</button>
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
                            onKeyDown={(e) => handleKeyDown(e, onAddInterest)}
                        />
                        <button onClick={onAddInterest} className="add-filter-btn">
                            +
                        </button>
                    </div>
                    <div className="selected-filters">
                        {selectedInterests.map((interest) => (
                            <span key={interest} className="filter-tag interest-tag">
                                {interest}
                                <button onClick={() => onRemoveInterest(interest)}>
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
