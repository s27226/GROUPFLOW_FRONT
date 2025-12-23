import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import ProfileBanner from "../components/ProfileBanner";
import SkeletonPost from "../components/ui/SkeletonPost";
import SkeletonCard from "../components/ui/SkeletonCard";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectPosts } from "../hooks/usePosts";
import { useGraphQL } from "../hooks/useGraphQL";
import { useAuth } from "../context/AuthContext";
import "../styles/ProfilePage.css";
import "../styles/feed.css";

export default function ProjectProfilePage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { executeQuery } = useGraphQL();
    const { user: authUser } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    const { posts, loading: postsLoading } = useProjectPosts(projectId);

    useEffect(() => {
        const fetchProjectProfile = async () => {
            if (!projectId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch project details
                const data = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT_BY_ID, {
                    id: parseInt(projectId)
                });

                console.log("Project response:", data);

                if (!data) {
                    console.error("No data received");
                    setLoading(false);
                    return;
                }

                // projectbyid returns an array, so we need to get the first element
                const projectArray = data.project?.projectbyid;
                const projectData = Array.isArray(projectArray) ? projectArray[0] : projectArray;

                console.log("Project data:", projectData);

                if (!projectData) {
                    console.error("Project not found - projectData is null");
                    setLoading(false);
                    return;
                }

                setProject({
                    id: projectData.id,
                    name: projectData.name,
                    description: projectData.description,
                    banner: `https://picsum.photos/900/200?random=${projectData.id}`,
                    image:
                        projectData.imageUrl ||
                        `https://picsum.photos/200?random=${projectData.id}`,
                    members: [
                        // Add owner as first member
                        {
                            userId: projectData.owner.id,
                            name: projectData.owner.nickname || projectData.owner.name,
                            role: "Owner",
                            image:
                                projectData.owner.profilePic ||
                                `https://i.pravatar.cc/60?u=${projectData.owner.id}`
                        },
                        // Add collaborators
                        ...(projectData.collaborators?.map((collab) => ({
                                userId: collab.user.id,
                                name: collab.user.nickname || collab.user.name,
                                role: collab.role,
                                image:
                                    collab.user.profilePic ||
                                    `https://i.pravatar.cc/60?u=${collab.user.id}`
                            })) || [])
                    ],
                    owner: projectData.owner
                });

                // Check if current user is the owner
                if (authUser && projectData.owner.id === authUser.id) {
                    setIsOwner(true);
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch project profile:", err);
                setLoading(false);
            }
        };

        fetchProjectProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    if (loading || postsLoading) {
        return (
            <div className="profile-layout">
                <Navbar />
                <div className="profile-content">
                    <Sidebar />
                    <div className="profile-main">
                        <div
                            className="profile-banner skeleton"
                            style={{ width: "900px", height: "200px" }}
                        ></div>
                        <div className="profile-header">
                            <div
                                className="profile-pfp skeleton"
                                style={{ width: "120px", height: "120px", borderRadius: "50%" }}
                            ></div>
                            <div style={{ flex: 1 }}>
                                <div
                                    className="skeleton"
                                    style={{ height: "30px", width: "200px", marginBottom: "10px" }}
                                ></div>
                                <div
                                    className="skeleton"
                                    style={{ height: "40px", width: "150px" }}
                                ></div>
                            </div>
                        </div>
                        <div className="profile-body">
                            <div className="profile-left">
                                <SkeletonCard count={2} />
                            </div>
                            <div className="profile-right">
                                <SkeletonPost count={2} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="profile-layout">
                <Navbar />
                <div className="profile-content">
                    <Sidebar />
                    <div className="profile-main">
                        <p>Project not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-layout">
            <Navbar />
            <div className="profile-content">
                <Sidebar />

                <div className="profile-main">
                    <ProfileBanner src={project.banner} alt="Project Banner" />

                    <div className="profile-header">
                        <img src={project.image} alt="Project" className="profile-pfp" />
                        <div className="profile-info">
                            <h2>{project.name}</h2>
                            {isOwner && (
                                <button
                                    className="edit-btn"
                                    onClick={() => navigate(`/project/${projectId}/edit`)}
                                >
                                    Edit Frontpage
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="profile-body">
                        <div className="profile-left">
                            <section className="about-me">
                                <h3>Description</h3>
                                <p>{project.description}</p>
                            </section>

                            <section className="owned-projects">
                                <h3>Members</h3>
                                <div className="profile-members-scroll">
                                    {project.members?.map((member, index) => (
                                        <div
                                            key={index}
                                            className="profile-member-card clickable"
                                            onClick={() => navigate(`/profile/${member.userId}`)}
                                        >
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="profile-member-pfp"
                                            />
                                            <p className="profile-member-name">{member.name}</p>
                                            <p className="profile-member-role">{member.role}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="profile-right">
                            <div className="profile-posts">
                                <h3>Activity</h3>
                                <div className="feed-container">
                                    {posts.length === 0 ? (
                                        <p>No activity yet</p>
                                    ) : (
                                        posts.map((post) => (
                                            <Post
                                                key={post.id}
                                                id={post.id}
                                                author={post.user.nickname}
                                                authorId={post.user.id}
                                                authorProfilePic={post.user.profilePic}
                                                time={post.time}
                                                content={post.content}
                                                image={post.imageUrl}
                                                comments={[]}
                                                saved={false}
                                                sharedPost={post.sharedPost}
                                                likes={0}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button
                className="create-post-btn"
                onClick={() => navigate(`/project/${projectId}/new-post`)}
            >
                <Plus size={26} />
            </button>
        </div>
    );
}
