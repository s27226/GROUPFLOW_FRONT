import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Sidebar } from "../../../components/layout";
import { ChatBox } from "../../../components/chat";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useGraphQL } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { sanitizeText } from "../../../utils/sanitize";
import styles from "./ProjectViewPage.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { FilesView, TerminsView, MembersPanel, ProjectInfoPanel } from "../../../components/projects";

interface ProjectOwner {
    id: string;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface ProjectUser {
    id: string;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface Collaborator {
    user: ProjectUser;
    role: string;
}

interface ProjectData {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    owner?: ProjectOwner;
    collaborators?: Collaborator[];
}

interface RawProjectOwner {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface RawCollaborator {
    userId: number;
    user: {
        id: number;
        name?: string;
        surname?: string;
        nickname?: string;
        profilePic?: string;
    };
    role: string;
}

interface RawProjectData {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    owner?: RawProjectOwner;
    collaborators?: RawCollaborator[];
}

interface GraphQLProjectResponse {
    project?: {
        projectbyid?: RawProjectData | RawProjectData[];
    };
}

export default function ProjectsViewPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { executeQuery } = useGraphQL();
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState("messages");
    const [project, setProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT_BY_ID, {
                    id: parseInt(id)
                }) as GraphQLProjectResponse | null;

                if (!data) {
                    console.error("No data received");
                    setLoading(false);
                    return;
                }

                const projectArray = data.project?.projectbyid;
                const rawProjectData = Array.isArray(projectArray) ? projectArray[0] : projectArray;
                if (!rawProjectData) {
                    console.error("Project not found");
                    setLoading(false);
                    return;
                }

                // Transform raw data with number IDs to string IDs
                const transformedProject: ProjectData = {
                    id: String(rawProjectData.id),
                    name: rawProjectData.name,
                    description: rawProjectData.description,
                    imageUrl: rawProjectData.imageUrl,
                    owner: rawProjectData.owner ? {
                        id: String(rawProjectData.owner.id),
                        name: rawProjectData.owner.name,
                        surname: rawProjectData.owner.surname,
                        nickname: rawProjectData.owner.nickname,
                        profilePic: rawProjectData.owner.profilePic
                    } : undefined,
                    collaborators: rawProjectData.collaborators?.map((c) => ({
                        user: {
                            id: String(c.user.id),
                            name: c.user.name,
                            surname: c.user.surname,
                            nickname: c.user.nickname,
                            profilePic: c.user.profilePic
                        },
                        role: c.role
                    }))
                };

                setProject(transformedProject);
                
                // Check if current user is owner or collaborator
                if (authUser) {
                    const userIdStr = String(authUser.id);
                    setIsOwner(transformedProject.owner?.id === userIdStr);
                    setIsCollaborator(transformedProject.collaborators?.some((c) => c.user.id === userIdStr) || false);
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
        const projectIdStr = id ?? '';
        switch (activeTab) {
            case "files":
                return <FilesView projectId={projectIdStr} isOwner={isOwner} isCollaborator={isCollaborator} />;
            case "termins":
                return <TerminsView projectId={projectIdStr} project={project} />;
            default:
                return <ChatBox projectId={projectIdStr} />;
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
                            <p>{t('projects.loadingProject')}</p>
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
                            <p>{t('projects.projectNotFound')}</p>
                            <button className={styles.backBtn} onClick={() => navigate("/myprojects")}>
                                {t('projects.backToProjects')}
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
                            {t('projects.backToProjects')}
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
                                {t('projects.files')}
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === "messages" ? styles.active : ""}`}
                                onClick={() => setActiveTab("messages")}
                            >
                                {t('projects.messagesTab')}
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === "termins" ? styles.active : ""}`}
                                onClick={() => setActiveTab("termins")}
                            >
                                {t('projects.termins')}
                            </button>
                        </div>
                        <div className={styles.tabContent}>{renderContent()}</div>
                    </div>
                    <div className={styles.projectSidebarPanels}>
                        <ProjectInfoPanel project={project} projectId={id ?? ''} />
                        <MembersPanel project={project} projectId={id ?? ''} />
                    </div>
                </div>
            </div>
        </div>
    );
}
