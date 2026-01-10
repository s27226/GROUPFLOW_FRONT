import { useNavigate } from "react-router-dom";
import { useTrendingProjects } from "../../../hooks";
import SkeletonCard from "../../ui/SkeletonCard";
import styles from "./Trending.module.css";

export default function Trending() {
    const navigate = useNavigate();
    const { projects, loading } = useTrendingProjects(5);

    if (loading) {
        return (
            <div className={styles.trendingBar}>
                <h3>Trending Projects</h3>
                <SkeletonCard count={5} />
            </div>
        );
    }

    if (!projects || projects.length === 0) {
        return (
            <div className={styles.trendingBar}>
                <h3>Trending Projects</h3>
                <p>No trending projects at the moment.</p>
            </div>
        );
    }

    return (
        <div className={styles.trendingBar}>
            <h3>Trending Projects</h3>
            <ul>
                {projects.map((project) => (
                    <li
                        key={project.id}
                        className={styles.trendingCard}
                        onClick={() => navigate(`/project/${project.id}`)}
                    >
                        <img
                            src={project.image}
                            alt={project.name}
                            className={styles.trendingImg}
                            onError={(e) => {
                                e.target.src = `https://picsum.photos/60?random=${project.id}`;
                            }}
                        />
                        <div className={styles.trendingInfo}>
                            <h4 className={styles.trendingName}>{project.name}</h4>
                            <p className={styles.trendingDesc}>{project.description}</p>
                            {project.owner && (
                                <span className={styles.trendingOwner}>
                                    by{" "}
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${project.owner.id}`);
                                        }}
                                        style={{
                                            cursor: "pointer",
                                            color: "var(--primary-color)",
                                            fontWeight: "500"
                                        }}
                                    >
                                        {project.owner.nickname}
                                    </span>
                                </span>
                            )}
                            <div className={styles.trendingStats}>
                                <span>👀 {project.viewCount ?? 0}</span>
                                <span>❤️ {project.likeCount ?? 0}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
