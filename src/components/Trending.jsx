import { useNavigate } from "react-router-dom";
import { useTrendingProjects } from "../hooks/useTrendingProjects";
import SkeletonCard from "./ui/SkeletonCard";
import "../styles/Trending.css";

export default function Trending() {
    const navigate = useNavigate();
    const { projects, loading } = useTrendingProjects(5);

    if (loading) {
        return (
            <div className="trending-bar">
                <h3>Trending Projects</h3>
                <SkeletonCard count={5} />
            </div>
        );
    }

    if (!projects || projects.length === 0) {
        return (
            <div className="trending-bar">
                <h3>Trending Projects</h3>
                <p>No trending projects at the moment.</p>
            </div>
        );
    }

    return (
        <div className="trending-bar">
            <h3>Trending Projects</h3>
            <ul>
                {projects.map((project) => (
                    <li key={project.id} className="trending-card" onClick={() => navigate(`/project/${project.id}`)}>
                        <img 
                            src={project.image} 
                            alt={project.name} 
                            className="trending-img"
                            onError={(e) => {
                                e.target.src = `https://picsum.photos/60?random=${project.id}`;
                            }}
                        />
                        <div className="trending-info">
                            <h4 className="trending-name">{project.name}</h4>
                            <p className="trending-desc">{project.description}</p>
                            {project.owner && (
                                <span className="trending-owner">
                                    by {project.owner.nickname}
                                </span>
                            )}
                            {(project.viewCount || project.likeCount) && (
                                <div className="trending-stats">
                                    {project.viewCount > 0 && (
                                        <span>👀 {project.viewCount}</span>
                                    )}
                                    {project.likeCount > 0 && (
                                        <span>❤️ {project.likeCount}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
