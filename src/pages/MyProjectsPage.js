import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SkeletonCard from "../components/ui/SkeletonCard";
import { useNavigate } from "react-router-dom";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import "../styles/MainComponents.css";
import "../styles/ProjectsPage.css";

export default function MyProjectsPage() {
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { executeQuery } = useGraphQL();

    useEffect(() => {
        const fetchMyProjects = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_PROJECTS, {});

                if (data) {
                    const projects = data.project.myprojects || [];
                    setMyProjects(
                        projects.map((project) => ({
                            id: project.id,
                            name: project.name,
                            description: project.description,
                            imageUrl:
                                project.imageUrl ||
                                `https://picsum.photos/300/200?random=${project.id}`,
                            owner: project.owner,
                            collaborators: project.collaborators || [],
                            lastUpdated: project.lastUpdated
                        }))
                    );
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch my projects:", err);
                setLoading(false);
                setMyProjects([]);
            }
        };

        fetchMyProjects();
    }, [executeQuery]);

    return (
        <div>
            <Navbar />
            <div className="maincomp-content">
                <Sidebar />
                <div className="maincomp-center-wrapper">
                    <div className="maincomp-feed-wrapper">
                        <div className="my-projects-header">
                            <h1 className="my-projects-title">My Projects</h1>
                            <p className="my-projects-subtitle">
                                Manage and collaborate on your projects
                            </p>
                        </div>
                        {loading ? (
                            <div className="projects-grid">
                                <SkeletonCard count={6} />
                            </div>
                        ) : myProjects.length === 0 ? (
                            <div className="no-projects-message">
                                <p>You don't have any projects yet.</p>
                                <button className="create-project-btn">Create New Project</button>
                            </div>
                        ) : (
                            <div className="projects-grid">
                                {myProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="my-project-card"
                                        onClick={() => navigate(`/project/${project.id}/workspace`)}
                                    >
                                        <img
                                            src={project.imageUrl}
                                            alt={project.name}
                                            className="my-project-card-img"
                                        />
                                        <div className="my-project-card-content">
                                            <h3>{project.name}</h3>
                                            <p>{project.description}</p>
                                            <div className="my-project-card-footer">
                                                <span className="my-project-owner">
                                                    by {project.owner?.nickname || "Unknown"}
                                                </span>
                                                {project.collaborators.length > 0 && (
                                                    <span className="my-project-collaborators">
                                                        {project.collaborators.length}{" "}
                                                        collaborator(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
