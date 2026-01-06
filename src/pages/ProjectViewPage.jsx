import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import { useAuth } from "../context/AuthContext";
import { sanitizeText } from "../utils/sanitize";
import "../styles/ProjectViewPage.css";
import { useNavigate, useParams } from "react-router-dom";
import FilesView from "../components/FilesView";
import TerminsView from "../components/TerminsView";
import MembersPanel from "../components/MembersPanel";
import ProjectInfoPanel from "../components/ProjectInfoPanel";

export default function ProjectsViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { executeQuery } = useGraphQL();
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState("messages");
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT_BY_ID, {
                    id: parseInt(id)
                });

                if (!data) {
                    console.error("No data received");
                    setLoading(false);
                    return;
                }

                const projectData = data.project?.projectbyid;
                if (!projectData) {
                    console.error("Project not found");
                    setLoading(false);
                    return;
                }

                setProject(projectData);
                
                // Check if current user is owner or collaborator
                if (authUser) {
                    if (Array.isArray(projectData)) {
                        const proj = projectData[0];
                        setIsOwner(proj?.owner?.id === authUser.id);
                        setIsCollaborator(proj?.collaborators?.some(c => c.userId === authUser.id) || false);
                    } else {
                        setIsOwner(projectData?.owner?.id === authUser.id);
                        setIsCollaborator(projectData?.collaborators?.some(c => c.userId === authUser.id) || false);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch project:", err);
                setLoading(false);
            }
        };

        fetchProject();
    }, [id, executeQuery, authUser]);

    const renderContent = () => {
        switch (activeTab) {
            case "files":
                return <FilesView projectId={id} isOwner={isOwner} isCollaborator={isCollaborator} />;
            case "termins":
                return <TerminsView projectId={id} project={project} />;
            default:
                return <ChatBox projectId={id} />;
        }
    };

    if (loading) {
        return (
            <div className="view-page-main-layout">
                <Navbar />
                <div className="view-page-main-content">
                    <Sidebar />
                    <div className="feed-projects-wrapper">
                        <div className="main-feed-wrapper">
                            <p>Loading project...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="view-page-main-layout">
                <Navbar />
                <div className="view-page-main-content">
                    <Sidebar />
                    <div className="feed-projects-wrapper">
                        <div className="main-feed-wrapper">
                            <p>Project not found</p>
                            <button className="back-btn" onClick={() => navigate("/myprojects")}>
                                ← Back to projects
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-page-main-layout">
            <Navbar />
            <div className="view-page-main-content">
                <Sidebar />
                <div className="feed-projects-wrapper">
                    <div className="main-feed-wrapper project-view-page">
                        <button className="back-btn" onClick={() => navigate("/myprojects")}>
                            ← Back to projects
                        </button>

                        <div className="project-header">
                            <h2>{sanitizeText(project.name)}</h2>
                            <p>{sanitizeText(project.description)}</p>
                        </div>

                        <div className="tabs">
                            <button
                                className={`tab-btn ${activeTab === "files" ? "active" : ""}`}
                                onClick={() => setActiveTab("files")}
                            >
                                📁 Files
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
                                onClick={() => setActiveTab("messages")}
                            >
                                ✉️ Messages
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "termins" ? "active" : ""}`}
                                onClick={() => setActiveTab("termins")}
                            >
                                🕒 Termins
                            </button>
                        </div>
                        <div className="tab-content">{renderContent()}</div>
                    </div>
                    <div className="project-sidebar-panels">
                        <ProjectInfoPanel project={project} projectId={id} />
                        <MembersPanel project={project} projectId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
