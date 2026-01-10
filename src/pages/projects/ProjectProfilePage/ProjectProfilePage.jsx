import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Navbar, Sidebar } from "../../../components/layout";
import { Post } from "../../../components/feed";
import { ProfileBanner } from "../../../components/profile";
import SkeletonPost from "../../../components/ui/SkeletonPost";
import SkeletonCard from "../../../components/ui/SkeletonCard";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectPosts, useGraphQL } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { sanitizeText } from "../../../utils/sanitize";
import profileStyles from "./ProjectProfilePage.module.css";
import feedStyles from "../../../components/feed/Feed/Feed.module.css";

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

                if (!data) {
                    console.error("No data received");
                    setLoading(false);
                    return;
                }

                // projectbyid returns an array, so we need to get the first element
                const projectArray = data.project?.projectbyid;
                const projectData = Array.isArray(projectArray) ? projectArray[0] : projectArray;

                if (!projectData) {
                    console.error("Project not found - projectData is null");
                    setLoading(false);
                    return;
                }

                setProject({
                    id: projectData.id,
                    name: projectData.name,
                    description: projectData.description,
                    banner: projectData.bannerUrl || `https://picsum.photos/900/200?random=${projectData.id}`,
                    image:
                        projectData.imageUrl ||
                        `https://picsum.photos/200?random=${projectData.id}`,
                    skills: projectData.skills || [],
                    interests: projectData.interests || [],
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
    }, [projectId, executeQuery, authUser]);

    if (loading || postsLoading) {
        return (
            <div className={profileStyles.profileLayout}>
                <Navbar />
                <div className={profileStyles.profileContent}>
                    <Sidebar />
                    <div className={profileStyles.profileMain}>
                        <div
                            className={`${profileStyles.profileBanner} skeleton`}
                            style={{ width: "900px", height: "200px" }}
                        ></div>
                        <div className={profileStyles.profileHeader}>
                            <div
                                className={`${profileStyles.profilePfp} skeleton`}
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
                        <div className={profileStyles.profileBody}>
                            <div className={profileStyles.profileLeft}>
                                <SkeletonCard count={2} />
                            </div>
                            <div className={profileStyles.profileRight}>
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
            <div className={profileStyles.profileLayout}>
                <Navbar />
                <div className={profileStyles.profileContent}>
                    <Sidebar />
                    <div className={profileStyles.profileMain}>
                        <p>Project not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={profileStyles.profileLayout}>
            <Navbar />
            <div className={profileStyles.profileContent}>
                <Sidebar />

                <div className={profileStyles.profileMain}>
                    <ProfileBanner src={project.banner} alt="Project Banner" />

                    <div className={profileStyles.profileHeader}>
                        <img src={project.image} alt="Project" className={profileStyles.profilePfp} />
                        <div className={profileStyles.profileInfo}>
                            <h2>{sanitizeText(project.name)}</h2>
                            {isOwner && (
                                <button
                                    className={profileStyles.editBtn}
                                    onClick={() => navigate(`/project/${projectId}/edit`)}
                                >
                                    Edit Frontpage
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={profileStyles.profileBody}>
                        <div className={profileStyles.profileLeft}>
                            <section className={profileStyles.aboutMe}>
                                <h3>Description</h3>
                                <p>{sanitizeText(project.description)}</p>
                            </section>

                            {project.skills && project.skills.length > 0 && (
                                <section className={profileStyles.aboutMe}>
                                    <h3>Skills</h3>
                                    <div className={profileStyles.tagsDisplay}>
                                        {project.skills.map((skill) => (
                                            <span key={skill.id} className={`${profileStyles.tag} ${profileStyles.skillTag}`}>
                                                {skill.skillName}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {project.interests && project.interests.length > 0 && (
                                <section className={profileStyles.aboutMe}>
                                    <h3>Interests</h3>
                                    <div className={profileStyles.tagsDisplay}>
                                        {project.interests.map((interest) => (
                                            <span key={interest.id} className={`${profileStyles.tag} ${profileStyles.interestTag}`}>
                                                {interest.interestName}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className={profileStyles.ownedProjects}>
                                <h3>Members</h3>
                                <div className={profileStyles.profileMembersScroll}>
                                    {project.members?.map((member, index) => (
                                        <div
                                            key={index}
                                            className={`${profileStyles.profileMemberCard} ${profileStyles.clickable}`}
                                            onClick={() => navigate(`/profile/${member.userId}`)}
                                        >
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className={profileStyles.profileMemberPfp}
                                            />
                                            <p className={profileStyles.profileMemberName}>{sanitizeText(member.name)}</p>
                                            <p className={profileStyles.profileMemberRole}>{sanitizeText(member.role)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className={profileStyles.profileRight}>
                            <div className={profileStyles.profilePosts}>
                                <h3>Activity</h3>
                                <div className={feedStyles.feedContainer}>
                                    {posts.length === 0 ? (
                                        <p>No activity yet</p>
                                    ) : (
                                        posts.map((post) => (
                                            <Post
                                                key={post.id}
                                                id={post.id}
                                                author={post.author}
                                                authorId={post.authorId}
                                                authorProfilePic={post.authorProfilePic}
                                                time={post.time}
                                                content={post.content}
                                                title={post.title}
                                                image={post.image}
                                                comments={post.comments || []}
                                                saved={false}
                                                sharedPost={post.sharedPost}
                                                likes={post.likes || []}
                                                projectId={projectId}
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
                className={profileStyles.createPostBtn}
                onClick={() => navigate(`/project/${projectId}/new-post`)}
            >
                <Plus size={26} />
            </button>
        </div>
    );
}
