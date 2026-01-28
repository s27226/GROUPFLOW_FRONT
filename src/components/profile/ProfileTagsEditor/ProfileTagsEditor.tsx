import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { translateError } from "../../../utils/errorTranslation";
import LoadingSpinner from "../../ui/LoadingSpinner";
import styles from "./ProfileTagsEditor.module.css";

interface Skill {
    id: string;
    skillName: string;
}

interface Interest {
    id: string;
    interestName: string;
}

interface TagsData {
    skills: Skill[];
    interests: Interest[];
}

interface UserTagQueryResponse {
    userTag?: {
        myskills?: Skill[];
        myinterests?: Interest[];
    };
}

interface AddSkillResponse {
    userTag?: {
        addskill: Skill;
    };
}

interface RemoveSkillResponse {
    userTag?: {
        removeskill: boolean;
    };
}

interface AddInterestResponse {
    userTag?: {
        addinterest: Interest;
    };
}

interface RemoveInterestResponse {
    userTag?: {
        removeinterest: boolean;
    };
}

const ProfileTagsEditor: React.FC = () => {
    const { t } = useTranslation();
    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");
    const { showToast } = useToast();

    // Load tags with unified query hook - use new API: (query, variables, options)
    const { data: tagsData, loading, setData: setTagsData } = useQuery<TagsData>(
        GRAPHQL_QUERIES.GET_MY_TAGS,
        {},
        {
            autoFetch: true,
            initialData: { skills: [], interests: [] },
            transform: (data: unknown): TagsData => {
                const typedData = data as UserTagQueryResponse | null;
                return {
                    skills: typedData?.userTag?.myskills || [],
                    interests: typedData?.userTag?.myinterests || []
                };
            }
        }
    );

    const skills = tagsData?.skills || [];
    const interests = tagsData?.interests || [];

    // Mutation hooks for adding/removing skills and interests
    const { mutate: addSkillMutation } = useMutationQuery<AddSkillResponse>(
        GRAPHQL_MUTATIONS.ADD_SKILL,
        {
            onSuccess: (data) => {
                if (data?.userTag?.addskill) {
                    setTagsData(prev => ({
                        skills: [...(prev?.skills || []), data.userTag!.addskill],
                        interests: prev?.interests || []
                    }));
                    setSkillInput("");
                    showToast(t('profile.skillAdded'), "success");
                }
            },
            onError: (error: Error) => showToast(translateError(error.message, 'profile.skillAddFailed'), "error")
        }
    );

    const { mutate: removeSkillMutation } = useMutationQuery<RemoveSkillResponse>(
        GRAPHQL_MUTATIONS.REMOVE_SKILL,
        {
            onError: (error: Error) => showToast(translateError(error.message, 'profile.skillRemoveFailed'), "error")
        }
    );

    const { mutate: addInterestMutation } = useMutationQuery<AddInterestResponse>(
        GRAPHQL_MUTATIONS.ADD_INTEREST,
        {
            onSuccess: (data) => {
                if (data?.userTag?.addinterest) {
                    setTagsData(prev => ({
                        skills: prev?.skills || [],
                        interests: [...(prev?.interests || []), data.userTag!.addinterest]
                    }));
                    setInterestInput("");
                    showToast(t('profile.interestAdded'), "success");
                }
            },
            onError: (error: Error) => showToast(translateError(error.message, 'profile.interestAddFailed'), "error")
        }
    );

    const { mutate: removeInterestMutation } = useMutationQuery<RemoveInterestResponse>(
        GRAPHQL_MUTATIONS.REMOVE_INTEREST,
        {
            onError: (error: Error) => showToast(translateError(error.message, 'profile.interestRemoveFailed'), "error")
        }
    );

    const addSkill = async (): Promise<void> => {
        if (!skillInput.trim()) return;
        await addSkillMutation({ input: { skillName: skillInput.trim() } });
    };

    const removeSkill = async (skillId: string): Promise<void> => {
        const result = await removeSkillMutation({ skillId });
        if (result?.userTag?.removeskill) {
            setTagsData((prev: TagsData | null) => ({
                skills: (prev?.skills || []).filter((s: Skill) => s.id !== skillId),
                interests: prev?.interests || []
            }));
            showToast(t('profile.skillRemoved'), "success");
        }
    };

    const addInterest = async (): Promise<void> => {
        if (!interestInput.trim()) return;
        await addInterestMutation({ input: { interestName: interestInput.trim() } });
    };

    const removeInterest = async (interestId: string): Promise<void> => {
        const result = await removeInterestMutation({ interestId });
        if (result?.userTag?.removeinterest) {
            setTagsData((prev: TagsData | null) => ({
                skills: prev?.skills || [],
                interests: (prev?.interests || []).filter((i: Interest) => i.id !== interestId)
            }));
            showToast(t('profile.interestRemoved'), "success");
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
            <h2>{t('profile.yourProfileTags')}</h2>
            <p className={styles.tagsDescription}>
                {t('profile.tagsDescription')}
            </p>

            <div className={styles.tagSection}>
                <h3>{t('profile.skills')}</h3>
                <p className={styles.sectionHint}>
                    {t('profile.skillsDescription')}
                </p>

                <div className={styles.tagInputGroup}>
                    <input
                        type="text"
                        placeholder={t('profile.skillsPlaceholder')}
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                    <button onClick={addSkill} className={styles.addTagBtn}>
                        {t('profile.addSkill')}
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
                                    title={t('profile.removeSkill')}
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noTags}>{t('profile.noSkills')}</p>
                    )}
                </div>
            </div>

            <div className={styles.tagSection}>
                <h3>{t('profile.interests')}</h3>
                <p className={styles.sectionHint}>
                    {t('profile.interestsHint')}
                </p>

                <div className={styles.tagInputGroup}>
                    <input
                        type="text"
                        placeholder={t('profile.interestsPlaceholder')}
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    />
                    <button onClick={addInterest} className={styles.addTagBtn}>
                        {t('profile.addInterest')}
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
                                    title={t('profile.removeInterest')}
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noTags}>{t('profile.noInterests')}</p>
                    )}
                </div>
            </div>

            <div className={styles.tagsSummary}>
                <p>
                    <Trans
                        i18nKey="profile.tagsSummary"
                        values={{ skillCount: skills.length, interestCount: interests.length }}
                        components={[<strong />, <strong />]}
                    />
                </p>
            </div>
        </div>
    );
};

export default ProfileTagsEditor;
