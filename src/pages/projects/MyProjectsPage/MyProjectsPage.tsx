import { useTranslation } from "react-i18next";
import { Layout } from "../../../components/layout";
import SkeletonCard from "../../../components/ui/SkeletonCard";
import { useNavigate } from "react-router-dom";
import { useMyProjects } from "../../../hooks";
import { getProjectImageUrl } from "../../../utils/profilePicture";
import styles from "./MyProjectsPage.module.css";

interface ProjectOwner {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface ProjectMember {
    id: number;
    userId: number;
    user: ProjectOwner;
    role?: string;
}

interface RawProject {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    owner?: ProjectOwner;
    members?: ProjectMember[];
}

export default function MyProjectsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    // Use unified hook for projects
    const { projects: rawProjects, loading } = useMyProjects({ autoFetch: true });
    
    // Map projects to the format expected by the UI
    const myProjects = (rawProjects ?? []).map((project: RawProject) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        imageUrl: getProjectImageUrl(project.imageUrl, project.id, 300),
        owner: project.owner,
        collaborators: project.members ?? []
    }));

    return (
        <Layout variant="compact" showTrending={false}>
            <div className={styles.myProjectsHeader}>
                <h1 className={styles.myProjectsTitle}>{t('projects.myProjects')}</h1>
                <p className={styles.myProjectsSubtitle}>
                    {t('projects.manageDescription')}
                </p>
            </div>
            {loading ? (
                <div className={styles.projectsGrid}>
                    <SkeletonCard count={6} />
                </div>
            ) : myProjects.length === 0 ? (
                <div className={styles.noProjectsMessage}>
                    <p>{t('projects.noProjectsYet')}</p>
                    <button 
                        className={styles.createProjectBtn}
                        onClick={() => navigate('/creategroup')}
                    >
                        {t('projects.createNewProject')}
                    </button>
                </div>
            ) : (
                <div className={styles.projectsGrid}>
                    {myProjects.map((project) => (
                        <div
                            key={project.id}
                            className={styles.myProjectCard}
                            onClick={() => navigate(`/project/${project.id}/workspace`)}
                        >
                            <img
                                src={project.imageUrl}
                                alt={project.name}
                                className={styles.myProjectCardImg}
                            />
                            <div className={styles.myProjectCardContent}>
                                <h3>{project.name}</h3>
                                <p>{project.description}</p>
                                <div className={styles.myProjectCardFooter}>
                                    <span className={styles.myProjectOwner}>
                                        {t('common.by')} {project.owner?.nickname || t('common.unknown')}
                                    </span>
                                    {project.collaborators.length > 0 && (
                                        <span className={styles.myProjectCollaborators}>
                                            {project.collaborators.length}{" "}
                                            {t('projects.collaborators')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}

