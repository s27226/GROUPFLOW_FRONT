import React from "react";
import styles from "./UserSearchFilters.module.css";

interface UserSearchFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    skillInput: string;
    setSkillInput: (value: string) => void;
    interestInput: string;
    setInterestInput: (value: string) => void;
    selectedSkills: string[];
    selectedInterests: string[];
    onSearch: () => void;
    onAddSkill: () => void;
    onRemoveSkill: (skill: string) => void;
    onAddInterest: () => void;
    onRemoveInterest: (interest: string) => void;
}

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
}: UserSearchFiltersProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void): void => {
        if (e.key === "Enter") {
            action();
        }
    };

    return (
        <div className={styles.searchSection}>
            <div className={styles.findFriendsSearch}>
                <input
                    type="text"
                    placeholder="Search by name or nickname..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, onSearch)}
                    className={styles.findFriendsInput}
                />
                <button onClick={onSearch} className={styles.findFriendsBtn}>
                    Search
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <h3>Filter by Skills</h3>
                    <div className={styles.filterInput}>
                        <input
                            type="text"
                            placeholder="Add skill..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, onAddSkill)}
                        />
                        <button onClick={onAddSkill} className={styles.addFilterBtn}>
                            +
                        </button>
                    </div>
                    <div className={styles.selectedFilters}>
                        {selectedSkills.map((skill) => (
                            <span key={skill} className={`${styles.filterTag} ${styles.skillTag}`}>
                                {skill}
                                <button onClick={() => onRemoveSkill(skill)}>×</button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <h3>Filter by Interests</h3>
                    <div className={styles.filterInput}>
                        <input
                            type="text"
                            placeholder="Add interest..."
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, onAddInterest)}
                        />
                        <button onClick={onAddInterest} className={styles.addFilterBtn}>
                            +
                        </button>
                    </div>
                    <div className={styles.selectedFilters}>
                        {selectedInterests.map((interest) => (
                            <span key={interest} className={`${styles.filterTag} ${styles.interestTag}`}>
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
