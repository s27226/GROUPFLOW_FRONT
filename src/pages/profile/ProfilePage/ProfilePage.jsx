import { useState, useEffect, useMemo } from "react";
import { Navbar, Sidebar } from "../../../components/layout";
import { Post } from "../../../components/feed";
import { ProfileBanner } from "../../../components/profile";
import SkeletonPost from "../../../components/ui/SkeletonPost";
import SkeletonCard from "../../../components/ui/SkeletonCard";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useNavigate, useParams } from "react-router-dom";
import { usePosts, useGraphQL, useFriends, useMyProjects, useUserProjects } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { sanitizeText } from "../../../utils/sanitize";
import styles from "./ProfilePage.module.css";
import feedStyles from "../../../components/feed/Feed/Feed.module.css";

export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth(); // Renamed to currentUser from authUser
    const { executeQuery, executeMutation } = useGraphQL();
    const { showToast } = useToast();

    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviting, setInviting] = useState(false);

    // Use unified hooks
    const { friends: myFriends } = useFriends({ autoFetch: false });
    const { projects: myProjects } = useMyProjects({ autoFetch: !!currentUser });
    const { projects: userProjects } = useUserProjects(user?.id, { autoFetch: !!user });
    
    // Derive state from hooks
    const isFriend = useMemo(() => 
        myFriends.some(friend => friend.id === user?.id),
        [myFriends, user]
    );
    
    const ownedProjects = useMemo(() => 
        myProjects.filter(p => p.owner?.id === currentUser?.id),
        [myProjects, currentUser]
    );
    
    const userProjectIds = useMemo(() => 
        new Set(userProjects.map(p => p.id)),
        [userProjects]
    );

    const { posts: allPosts, loading: postsLoading } = usePosts();

    // Filter posts by current user
    const posts = useMemo(() => {
        if (!user || !allPosts) return [];
        return allPosts.filter((post) => post.user?.id === user.id);
    }, [allPosts, user]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Fetch user details (either from userId param or current user)
                const userData = await executeQuery(
                    userId ? GRAPHQL_QUERIES.GET_USER_BY_ID : GRAPHQL_QUERIES.GET_CURRENT_USER,
                    userId ? { id: parseInt(userId) } : {}
                );

                if (!userData || !userData.users) {
                    console.error("User not found");
                    setLoading(false);
                    return;
                }

                const userInfo = userId ? userData.users?.getuserbyid : userData.users?.me;

                if (!userInfo) {
                    console.error("User not found");
                    setLoading(false);
                    return;
                }

                setUser({
                    id: userInfo.id,
                    name: userInfo.name || '',
                    surname: userInfo.surname || '',
                    handle: `@${userInfo.nickname || 'unknown'}`,
                    bio: "Professional developer", // TODO: Add bio field to backend
                    banner: userInfo.bannerPicUrl || userInfo.bannerPic || `https://picsum.photos/900/200?random=${userInfo.id}`,
                    pfp: userInfo.profilePicUrl || userInfo.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${userInfo.nickname || userInfo.id}`,
                    abt: `Member since ${userInfo.joined ? new Date(userInfo.joined).toLocaleDateString() : 'Unknown'}`
                });

                // Fetch user's projects
                const projectsData = await executeQuery(GRAPHQL_QUERIES.GET_USER_PROJECTS, {
                    userId: userInfo.id
                });

                if (projectsData && projectsData.project) {
                    const projects = projectsData.project?.userprojects || [];
                    setProjects(
                        projects.map((project) => ({
                            id: project.id,
                            name: project.name,
                            description: project.description,
                            image:
                                project.imageUrl || `https://picsum.photos/60?random=${project.id}`
                        }))
                    );
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId, executeQuery]);

    const handleInviteToProject = async (projectId) => {
        if (!currentUser || !user) return;

        setInviting(true);
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.CREATE_PROJECT_INVITATION, {
                input: {
                    projectId: parseInt(projectId),
                    invitingId: currentUser.id,
                    invitedId: user.id
                }
            });

            if (response.errors) {
                throw new Error(response.errors[0].message);
            }

            showToast(`Invitation sent to ${user.name} ${user.surname}!`, 'success');
            setShowInviteModal(false);
        } catch (err) {
            console.error("Failed to send invitation:", err);
            const errorMessage = err.message || "Failed to send invitation. They may already be invited or a member.";
            showToast(errorMessage, 'error');
        } finally {
            setInviting(false);
        }
    };

    if (loading || postsLoading) {
        return (
            <div className={styles.profileLayout}>
                <Navbar />
                <div className={styles.profileContent}>
                    <Sidebar />
                    <div className={styles.profileMain}>
                        <div
                            className={`${styles.profileBanner} skeleton`}
                            style={{ width: "900px", height: "200px" }}
                        ></div>
                        <div className={styles.profileHeader}>
                            <div
                                className={`${styles.profilePfp} skeleton`}
                                style={{ width: "120px", height: "120px", borderRadius: "50%" }}
                            ></div>
                            <div style={{ flex: 1 }}>
                                <div
                                    className="skeleton"
                                    style={{ height: "30px", width: "200px", marginBottom: "10px" }}
                                ></div>
                                <div
                                    className="skeleton"
                                    style={{ height: "20px", width: "150px", marginBottom: "10px" }}
                                ></div>
                                <div
                                    className="skeleton"
                                    style={{ height: "16px", width: "300px" }}
                                ></div>
                            </div>
                        </div>
                        <div className={styles.profileBody}>
                            <div className={styles.profileLeft}>
                                <SkeletonCard count={2} />
                            </div>
                            <div className={styles.profileRight}>
                                <SkeletonPost count={2} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.profileLayout}>
                <Navbar />
                <div className={styles.profileContent}>
                    <Sidebar />
                    <div className={styles.profileMain}>
                        <p>User not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profileLayout}>
            <Navbar />
            <div className={styles.profileContent}>
                <Sidebar />

                <div className={styles.profileMain}>
                    <ProfileBanner src={user.banner} alt="Banner" />

                    <div className={styles.profileHeader}>
                        <img src={user.pfp} alt="Profile" className={styles.profilePfp} />
                        <div className={styles.profileInfo}>
                            <h2>
                                {sanitizeText(user.name)} {sanitizeText(user.surname)}
                            </h2>
                            <p className={styles.username}>{sanitizeText(user.handle)}</p>
                            <p className={styles.bio}>{sanitizeText(user.bio)}</p>
                            {currentUser && user.id === currentUser.id && (
                                <button
                                    className={styles.editBtn}
                                    onClick={() => navigate("/profile/edit")}
                                >
                                    Edit Profile
                                </button>
                            )}
                            {currentUser && user.id !== currentUser.id && isFriend && ownedProjects.length > 0 && (
                                <button
                                    className={styles.inviteBtn}
                                    onClick={() => setShowInviteModal(true)}
                                >
                                    Invite to Project
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.profileBody}>
                        <div className={styles.profileLeft}>
                            <section className={styles.aboutMe}>
                                <h3>About Me</h3>
                                <p>{user.abt}</p>
                            </section>

                            <section className={styles.ownedProjects}>
                                <h3>Part of projects</h3>
                                <div className={styles.projectsScroll}>
                                    {projects.length === 0 ? (
                                        <p>No projects yet</p>
                                    ) : (
                                        projects.map((proj) => (
                                            <div
                                                key={proj.id}
                                                className={`${styles.projectCard} ${styles.clickable}`}
                                                onClick={() => navigate(`/project/${proj.id}`)}
                                            >
                                                <img src={proj.image} alt={proj.name} />
                                                <p>{proj.name}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className={styles.profileRight}>
                            <div className={styles.profilePosts}>
                                <h3>Activity</h3>
                                <div className={feedStyles.feedContainer}>
                                    {posts.length === 0 ? (
                                        <p>No posts yet</p>
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
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invite to Project Modal */}
                {showInviteModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h3>Invite {user.name} to a Project</h3>
                            <div className={styles.projectList}>
                                {ownedProjects.length === 0 ? (
                                    <p>You don't own any projects yet.</p>
                                ) : (
                                    ownedProjects.map((project) => {
                                        const isAlreadyMember = userProjectIds.has(project.id);
                                        return (
                                            <div key={project.id} className={styles.projectInviteItem}>
                                                <div>
                                                    <strong>{project.name}</strong>
                                                    <p>{project.description}</p>
                                                    {isAlreadyMember && (
                                                        <small style={{ 
                                                            color: '#888', 
                                                            fontStyle: 'italic',
                                                            fontSize: '0.85em',
                                                            opacity: 0.8,
                                                            fontWeight: 300
                                                        }}>
                                                            ℹ Already a member
                                                        </small>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleInviteToProject(project.id)}
                                                    disabled={inviting || isAlreadyMember}
                                                    style={{
                                                        opacity: isAlreadyMember ? 0.5 : 1,
                                                        cursor: isAlreadyMember ? 'not-allowed' : 'pointer',
                                                        backgroundColor: isAlreadyMember ? '#ccc' : ''
                                                    }}
                                                >
                                                    {isAlreadyMember ? "Member" : inviting ? "Inviting..." : "Invite"}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <button
                                className={styles.closeModalBtn}
                                onClick={() => setShowInviteModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
