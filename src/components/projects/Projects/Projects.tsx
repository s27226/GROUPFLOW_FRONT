import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useMutationQuery } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { translateError } from "../../../utils/errorTranslation";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { getProjectImageUrl } from "../../../utils/profilePicture";
import styles from "./Projects.module.css";

interface ProjectSkill {
    id: string;
    skillName: string;
}

interface ProjectInterest {
    id: string;
    interestName: string;
}

interface ProjectOwner {
    nickname?: string;
    name?: string;
}

interface ProjectSearchResult {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    owner: ProjectOwner;
    skills?: ProjectSkill[];
    interests?: ProjectInterest[];
    views?: unknown[];
}

interface SearchProjectsResponse {
    project?: {
        searchprojects?: ProjectSearchResult[];
    };
}

export default function Projects() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<ProjectSearchResult[]>([]);
    const navigate = useNavigate();

    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");

    const { mutate: searchProjects, loading } = useMutationQuery<SearchProjectsResponse>(
        GRAPHQL_QUERIES.SEARCH_PROJECTS,
        {
            onSuccess: (data) => {
                const results = data?.project?.searchprojects || [];
                setSearchResults(results);
            },
            onError: (err) => {
                showToast(translateError(err.message, 'common.errorOccurred'), 'error');
            }
        }
    );

    const handleSearchWithQuery = useCallback(async (query: string): Promise<void> => {
        const input = {
            searchTerm: query || null,
            skills: selectedSkills.length > 0 ? selectedSkills : null,
            interests: selectedInterests.length > 0 ? selectedInterests : null
        };
        await searchProjects({ input });
    }, [searchProjects, selectedSkills, selectedInterests]);

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
    }, [handleSearchWithQuery]);

    const handleSearch = async () => {
        await handleSearchWithQuery(searchTerm);
    };

    const addSkillFilter = () => {
        if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
            setSelectedSkills([...selectedSkills, skillInput.trim()]);
            setSkillInput("");
        }
    };

    const removeSkillFilter = (skill: string): void => {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    };

    const addInterestFilter = (): void => {
        if (interestInput.trim() && !selectedInterests.includes(interestInput.trim())) {
            setSelectedInterests([...selectedInterests, interestInput.trim()]);
            setInterestInput("");
        }
    };

    const removeInterestFilter = (interest: string): void => {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    };

    const renderProjectCard = (project: ProjectSearchResult): React.ReactNode => {
        return (
            <div key={project.id} className={styles.userCard}>
                <div 
                    className={styles.userCardHeader}
                    onClick={() => navigate(`/project/${project.id}`)}
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src={getProjectImageUrl(project.imageUrl, project.id, 80)}
                        alt={project.name}
                        className={styles.userAvatar}
                    />
                    <div className={styles.userInfo}>
                        <h3>{project.name}</h3>
                        <p className={styles.userName}>
                            by {project.owner.nickname || project.owner.name}
                        </p>
                        <p className={styles.projectDescription}>{project.description}</p>
                    </div>
                </div>

                {project.skills && project.skills.length > 0 && (
                    <div className={styles.userTags}>
                        <h4>Skills:</h4>
                        <div className={styles.tagsList}>
                            {project.skills.map((skill) => (
                                <span key={skill.id} className={`${styles.tag} ${styles.skillTag}`}>
                                    {skill.skillName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {project.interests && project.interests.length > 0 && (
                    <div className={styles.userTags}>
                        <h4>Interests:</h4>
                        <div className={styles.tagsList}>
                            {project.interests.map((interest) => (
                                <span key={interest.id} className={`${styles.tag} ${styles.interestTag}`}>
                                    {interest.interestName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.projectStats}>
                    <span>👁️ {project.views?.length || 0} views</span>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.usersContainer}>
            <h1>{t('projects.findProjects')}</h1>

            <div className={styles.searchSection}>
                <div className={styles.findFriendsSearch}>
                    <input
                        type="text"
                        placeholder={t('projects.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className={styles.findFriendsInput}
                    />
                    <button onClick={handleSearch} className={styles.findFriendsBtn}>
                        {t('common.search')}
                    </button>
                </div>

                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <h3>{t('projects.filterBySkills')}</h3>
                        <div className={styles.filterInput}>
                            <input
                                type="text"
                                placeholder={t('projects.addSkillPlaceholder')}
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addSkillFilter()}
                            />
                            <button onClick={addSkillFilter} className={styles.addFilterBtn}>
                                +
                            </button>
                        </div>
                        <div className={styles.selectedFilters}>
                            {selectedSkills.map((skill) => (
                                <span key={skill} className={`${styles.filterTag} ${styles.skillTag}`}>
                                    {skill}
                                    <button onClick={() => removeSkillFilter(skill)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <h3>{t('projects.filterByInterests')}</h3>
                        <div className={styles.filterInput}>
                            <input
                                type="text"
                                placeholder={t('projects.addInterestPlaceholder')}
                                value={interestInput}
                                onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addInterestFilter()}
                            />
                            <button onClick={addInterestFilter} className={styles.addFilterBtn}>
                                +
                            </button>
                        </div>
                        <div className={styles.selectedFilters}>
                            {selectedInterests.map((interest) => (
                                <span key={interest} className={`${styles.filterTag} ${styles.interestTag}`}>
                                    {interest}
                                    <button onClick={() => removeInterestFilter(interest)}>
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.results}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : searchResults.length > 0 ? (
                        <div className={styles.userCards}>
                            {searchResults.map((project) => renderProjectCard(project))}
                        </div>
                    ) : (
                        <p className={styles.noResults}>
                            {searchTerm ||
                            selectedSkills.length > 0 ||
                            selectedInterests.length > 0
                                ? t('projects.noProjectsMatchCriteria')
                                : t('projects.enterSearchCriteria')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
