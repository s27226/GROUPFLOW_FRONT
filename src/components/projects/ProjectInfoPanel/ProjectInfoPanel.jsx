import styles from "./ProjectInfoPanel.module.css";
import { useNavigate } from "react-router-dom";

export default function ProjectInfoPanel({ project, projectId }) {
    const navigate = useNavigate();

    if (!project) return null;

    return (
        <div className={styles.projectInfoPanel}>
            <div className={styles.projectInfoHeader}>
                <img
                    src={project.imageUrl || `https://picsum.photos/200?random=${projectId}`}
                    alt={project.name}
                    className={styles.projectInfoImage}
                />
                <div className={styles.projectInfoDetails}>
                    <h3>{project.name}</h3>
                    <p className={styles.projectInfoOwner}>
                        by{" "}
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
                            {project.owner?.nickname || "Unknown"}
                        </span>
                    </p>
                </div>
            </div>

            <button
                className={styles.viewProjectProfileBtn}
                onClick={() => navigate(`/project/${projectId}`)}
            >
                View Project Profile
            </button>
        </div>
    );
}
