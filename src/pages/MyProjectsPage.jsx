import { useState } from "react";
import { Navbar, Sidebar } from "../components/layout";
import SkeletonCard from "../components/ui/SkeletonCard";
import { useNavigate } from "react-router-dom";
import { useMyProjects } from "../hooks/useProjects";
import "../styles/MainComponents.css";
import "../styles/ProjectsPage.css";

export default function MyProjectsPage() {
    const navigate = useNavigate();
    
    // Use unified hook for projects
    const { projects: rawProjects, loading } = useMyProjects({ autoFetch: true });
    
    // Map projects to the format expected by the UI
    const myProjects = rawProjects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        imageUrl:
            project.imageUrl ||
            `https://picsum.photos/300/200?random=${project.id}`,
        owner: project.owner,
        collaborators: project.collaborators || [],
        lastUpdated: project.lastUpdated
    }));

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
                                <button 
                                    className="create-project-btn"
                                    onClick={() => navigate('/creategroup')}
                                >
                                    Create New Project
                                </button>
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
