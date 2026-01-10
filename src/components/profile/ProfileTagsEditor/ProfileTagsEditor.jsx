import { useState } from "react";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import LoadingSpinner from "../../ui/LoadingSpinner";
import styles from "./ProfileTagsEditor.module.css";

export default function ProfileTagsEditor() {
    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");
    const { showToast } = useToast();

    // Load tags with unified query hook - use new API: (query, variables, options)
    const { data: tagsData, loading, setData: setTagsData } = useQuery(
        GRAPHQL_QUERIES.GET_MY_TAGS,
        {},
        {
            autoFetch: true,
            initialData: { skills: [], interests: [] },
            transform: (data) => ({
                skills: data?.userTag?.myskills || [],
                interests: data?.userTag?.myinterests || []
            })
        }
    );

    const skills = tagsData?.skills || [];
    const interests = tagsData?.interests || [];

    // Mutation hooks for adding/removing skills and interests
    const { mutate: addSkillMutation } = useMutationQuery(
        GRAPHQL_MUTATIONS.ADD_SKILL,
        {
            onSuccess: (data) => {
                if (data?.userTag?.addskill) {
                    setTagsData(prev => ({
                        skills: [...(prev?.skills || []), data.userTag.addskill],
                        interests: prev?.interests || []
                    }));
                    setSkillInput("");
                    showToast("Skill added successfully", "success");
                }
            },
            onError: () => showToast("Failed to add skill", "error")
        }
    );

    const { mutate: removeSkillMutation } = useMutationQuery(
        GRAPHQL_MUTATIONS.REMOVE_SKILL,
        {
            onError: () => showToast("Failed to remove skill", "error")
        }
    );

    const { mutate: addInterestMutation } = useMutationQuery(
        GRAPHQL_MUTATIONS.ADD_INTEREST,
        {
            onSuccess: (data) => {
                if (data?.userTag?.addinterest) {
                    setTagsData(prev => ({
                        skills: prev?.skills || [],
                        interests: [...(prev?.interests || []), data.userTag.addinterest]
                    }));
                    setInterestInput("");
                    showToast("Interest added successfully", "success");
                }
            },
            onError: () => showToast("Failed to add interest", "error")
        }
    );

    const { mutate: removeInterestMutation } = useMutationQuery(
        GRAPHQL_MUTATIONS.REMOVE_INTEREST,
        {
            onError: () => showToast("Failed to remove interest", "error")
        }
    );

    const addSkill = async () => {
        if (!skillInput.trim()) return;
        await addSkillMutation({ input: { skillName: skillInput.trim() } });
    };

    const removeSkill = async (skillId) => {
        const result = await removeSkillMutation({ skillId });
        if (result?.userTag?.removeskill) {
            setTagsData(prev => ({
                skills: (prev?.skills || []).filter((s) => s.id !== skillId),
                interests: prev?.interests || []
            }));
            showToast("Skill removed", "success");
        }
    };

    const addInterest = async () => {
        if (!interestInput.trim()) return;
        await addInterestMutation({ input: { interestName: interestInput.trim() } });
    };

    const removeInterest = async (interestId) => {
        const result = await removeInterestMutation({ interestId });
        if (result?.userTag?.removeinterest) {
            setTagsData(prev => ({
                skills: prev?.skills || [],
                interests: (prev?.interests || []).filter((i) => i.id !== interestId)
            }));
            showToast("Interest removed", "success");
        }
    };

    if (loading) {
        return (
            <div className={styles.profileTagsEditor}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={styles.profileTagsEditor}>
            <h2>Your Profile Tags</h2>
            <p className={styles.tagsDescription}>
                Add skills and interests to help others find you and get better friend
                recommendations!
            </p>

            <div className={styles.tagSection}>
                <h3>Skills</h3>
                <p className={styles.sectionHint}>
                    Technical abilities, programming languages, tools, etc.
                </p>

                <div className={styles.tagInputGroup}>
                    <input
                        type="text"
                        placeholder="e.g., Python, JavaScript, Machine Learning..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                    <button onClick={addSkill} className={styles.addTagBtn}>
                        Add Skill
                    </button>
                </div>

                <div className={styles.tagsDisplay}>
                    {skills.length > 0 ? (
                        skills.map((skill) => (
                            <div key={skill.id} className={`${styles.tagItem} ${styles.skillTag}`}>
                                <span>{skill.skillName}</span>
                                <button
                                    onClick={() => removeSkill(skill.id)}
                                    className={styles.removeTagBtn}
                                    title="Remove skill"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noTags}>No skills added yet.</p>
                    )}
                </div>
            </div>

            <div className={styles.tagSection}>
                <h3>Interests</h3>
                <p className={styles.sectionHint}>
                    Hobbies, topics you're passionate about, activities you enjoy...
                </p>

                <div className={styles.tagInputGroup}>
                    <input
                        type="text"
                        placeholder="e.g., Photography, Gaming, Music..."
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    />
                    <button onClick={addInterest} className={styles.addTagBtn}>
                        Add Interest
                    </button>
                </div>

                <div className={styles.tagsDisplay}>
                    {interests.length > 0 ? (
                        interests.map((interest) => (
                            <div key={interest.id} className={`${styles.tagItem} ${styles.interestTag}`}>
                                <span>{interest.interestName}</span>
                                <button
                                    onClick={() => removeInterest(interest.id)}
                                    className={styles.removeTagBtn}
                                    title="Remove interest"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noTags}>No interests added yet.</p>
                    )}
                </div>
            </div>

            <div className={styles.tagsSummary}>
                <p>
                    <strong>{skills.length}</strong> skill{skills.length !== 1 ? "s" : ""} and{" "}
                    <strong>{interests.length}</strong> interest{interests.length !== 1 ? "s" : ""}{" "}
                    added
                </p>
            </div>
        </div>
    );
}
