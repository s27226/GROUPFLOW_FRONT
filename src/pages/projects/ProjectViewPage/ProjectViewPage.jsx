import { useState, useEffect } from "react";
import { Navbar, Sidebar } from "../../../components/layout";
import { ChatBox } from "../../../components/chat";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useGraphQL } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { sanitizeText } from "../../../utils/sanitize";
import styles from "./ProjectViewPage.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { FilesView, TerminsView, MembersPanel, ProjectInfoPanel } from "../../../components/projects";

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
            <div className={styles.viewPageMainLayout}>
                <Navbar />
                <div className={styles.viewPageMainContent}>
                    <Sidebar />
                    <div className={styles.feedProjectsWrapper}>
                        <div className={styles.mainFeedWrapper}>
                            <p>Loading project...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className={styles.viewPageMainLayout}>
                <Navbar />
                <div className={styles.viewPageMainContent}>
                    <Sidebar />
                    <div className={styles.feedProjectsWrapper}>
                        <div className={styles.mainFeedWrapper}>
                            <p>Project not found</p>
                            <button className={styles.backBtn} onClick={() => navigate("/myprojects")}>
                                ← Back to projects
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.viewPageMainLayout}>
            <Navbar />
            <div className={styles.viewPageMainContent}>
                <Sidebar />
                <div className={styles.feedProjectsWrapper}>
                    <div className={`${styles.mainFeedWrapper} ${styles.projectViewPage}`}>
                        <button className={styles.backBtn} onClick={() => navigate("/myprojects")}>
                            ← Back to projects
                        </button>

                        <div className={styles.projectHeader}>
                            <h2>{sanitizeText(project.name)}</h2>
                            <p>{sanitizeText(project.description)}</p>
                        </div>

                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tabBtn} ${activeTab === "files" ? styles.active : ""}`}
                                onClick={() => setActiveTab("files")}
                            >
                                📁 Files
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === "messages" ? styles.active : ""}`}
                                onClick={() => setActiveTab("messages")}
                            >
                                ✉️ Messages
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === "termins" ? styles.active : ""}`}
                                onClick={() => setActiveTab("termins")}
                            >
                                🕒 Termins
                            </button>
                        </div>
                        <div className={styles.tabContent}>{renderContent()}</div>
                    </div>
                    <div className={styles.projectSidebarPanels}>
                        <ProjectInfoPanel project={project} projectId={id} />
                        <MembersPanel project={project} projectId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
