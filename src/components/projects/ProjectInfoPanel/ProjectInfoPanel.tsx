import { useTranslation } from "react-i18next";
import styles from "./ProjectInfoPanel.module.css";
import { useNavigate } from "react-router-dom";
import { getProjectImageUrl } from "../../../utils/profilePicture";

interface ProjectOwner {
    id: string;
    nickname?: string;
}

interface ProjectData {
    name: string;
    imageUrl?: string;
    owner?: ProjectOwner;
}

interface ProjectInfoPanelProps {
    project: ProjectData | null;
    projectId: string;
}

export default function ProjectInfoPanel({ project, projectId }: ProjectInfoPanelProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!project) return null;

    return (
        <div className={styles.projectInfoPanel}>
            <div className={styles.projectInfoHeader}>
                <img
                    src={getProjectImageUrl(project.imageUrl, projectId, 200)}
                    alt={project.name}
                    className={styles.projectInfoImage}
                />
                <div className={styles.projectInfoDetails}>
                    <h3>{project.name}</h3>
                    <p className={styles.projectInfoOwner}>
                        {t('common.by')}{" "}
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                if (project.owner?.id) navigate(`/profile/${project.owner.id}`);
                            }}
                            style={{
                                cursor: "pointer",
                                color: "var(--primary-color)",
                                fontWeight: "500"
                            }}
                        >
                            {project.owner?.nickname || t('common.unknown')}
                        </span>
                    </p>
                </div>
            </div>

            <button
                className={styles.viewProjectProfileBtn}
                onClick={() => navigate(`/project/${projectId}`)}
            >
                {t('projects.viewProjectProfile')}
            </button>
        </div>
    );
}
