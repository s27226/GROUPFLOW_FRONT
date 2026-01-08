import "./ProjectInfoPanel.css";
import { useNavigate } from "react-router-dom";

export default function ProjectInfoPanel({ project, projectId }) {
    const navigate = useNavigate();

    if (!project) return null;

    return (
        <div className="project-info-panel">
            <div className="project-info-header">
                <img
                    src={project.imageUrl || `https://picsum.photos/200?random=${projectId}`}
                    alt={project.name}
                    className="project-info-image"
                />
                <div className="project-info-details">
                    <h3>{project.name}</h3>
                    <p className="project-info-owner">
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
                className="view-project-profile-btn"
                onClick={() => navigate(`/project/${projectId}`)}
            >
                View Project Profile
            </button>
        </div>
    );
}
