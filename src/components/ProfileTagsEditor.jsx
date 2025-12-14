import { useState, useEffect } from "react";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import "../styles/ProfileTagsEditor.css";

export default function ProfileTagsEditor() {
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");
    const { executeQuery, executeMutation } = useGraphQL();

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        setLoading(true);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_TAGS, {});
            setSkills(data?.userTag?.myskills || []);
            setInterests(data?.userTag?.myinterests || []);
        } catch (err) {
            console.error("Failed to load tags:", err);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = async () => {
        if (!skillInput.trim()) return;

        try {
            const data = await executeMutation(GRAPHQL_QUERIES.ADD_SKILL, {
                input: { skillName: skillInput.trim() }
            });

            if (data?.userTag?.addskill) {
                setSkills([...skills, data.userTag.addskill]);
                setSkillInput("");
            }
        } catch (err) {
            console.error("Failed to add skill:", err);
            alert("Failed to add skill");
        }
    };

    const removeSkill = async (skillId) => {
        try {
            const success = await executeMutation(GRAPHQL_QUERIES.REMOVE_SKILL, {
                skillId
            });

            if (success?.userTag?.removeskill) {
                setSkills(skills.filter(s => s.id !== skillId));
            }
        } catch (err) {
            console.error("Failed to remove skill:", err);
            alert("Failed to remove skill");
        }
    };

    const addInterest = async () => {
        if (!interestInput.trim()) return;

        try {
            const data = await executeMutation(GRAPHQL_QUERIES.ADD_INTEREST, {
                input: { interestName: interestInput.trim() }
            });

            if (data?.userTag?.addinterest) {
                setInterests([...interests, data.userTag.addinterest]);
                setInterestInput("");
            }
        } catch (err) {
            console.error("Failed to add interest:", err);
            alert("Failed to add interest");
        }
    };

    const removeInterest = async (interestId) => {
        try {
            const success = await executeMutation(GRAPHQL_QUERIES.REMOVE_INTEREST, {
                interestId
            });

            if (success?.userTag?.removeinterest) {
                setInterests(interests.filter(i => i.id !== interestId));
            }
        } catch (err) {
            console.error("Failed to remove interest:", err);
            alert("Failed to remove interest");
        }
    };

    if (loading) {
        return (
            <div className="profile-tags-editor">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="profile-tags-editor">
            <h2>Your Profile Tags</h2>
            <p className="tags-description">
                Add skills and interests to help others find you and get better friend recommendations!
            </p>

            <div className="tag-section">
                <h3>Skills</h3>
                <p className="section-hint">Technical abilities, programming languages, tools, etc.</p>
                
                <div className="tag-input-group">
                    <input
                        type="text"
                        placeholder="e.g., Python, JavaScript, Machine Learning..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                    <button onClick={addSkill} className="add-tag-btn">
                        Add Skill
                    </button>
                </div>

                <div className="tags-display">
                    {skills.length > 0 ? (
                        skills.map(skill => (
                            <div key={skill.id} className="tag-item skill-tag">
                                <span>{skill.skillName}</span>
                                <button 
                                    onClick={() => removeSkill(skill.id)}
                                    className="remove-tag-btn"
                                    title="Remove skill"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-tags">No skills added yet.</p>
                    )}
                </div>
            </div>

            <div className="tag-section">
                <h3>Interests</h3>
                <p className="section-hint">Hobbies, topics you're passionate about, activities you enjoy...</p>
                
                <div className="tag-input-group">
                    <input
                        type="text"
                        placeholder="e.g., Photography, Gaming, Music..."
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    />
                    <button onClick={addInterest} className="add-tag-btn">
                        Add Interest
                    </button>
                </div>

                <div className="tags-display">
                    {interests.length > 0 ? (
                        interests.map(interest => (
                            <div key={interest.id} className="tag-item interest-tag">
                                <span>{interest.interestName}</span>
                                <button 
                                    onClick={() => removeInterest(interest.id)}
                                    className="remove-tag-btn"
                                    title="Remove interest"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-tags">No interests added yet.</p>
                    )}
                </div>
            </div>

            <div className="tags-summary">
                <p>
                    <strong>{skills.length}</strong> skill{skills.length !== 1 ? 's' : ''} and{' '}
                    <strong>{interests.length}</strong> interest{interests.length !== 1 ? 's' : ''} added
                </p>
            </div>
        </div>
    );
}
