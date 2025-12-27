import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import ProfileBanner from "../components/ProfileBanner";
import SkeletonPost from "../components/ui/SkeletonPost";
import SkeletonCard from "../components/ui/SkeletonCard";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useNavigate, useParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { useAuth } from "../context/AuthContext";
import { useGraphQL } from "../hooks/useGraphQL";
import { useToast } from "../context/ToastContext";
import "../styles/ProfilePage.css";
import "../styles/feed.css";

export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { executeQuery, executeMutation } = useGraphQL();
    const { showToast } = useToast();

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [userProjectIds, setUserProjectIds] = useState(new Set());
    const [inviting, setInviting] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    const { posts: allPosts, loading: postsLoading } = usePosts();

    // Filter posts by current user
    const posts = useMemo(() => {
        if (!user || !allPosts) return [];
        return allPosts.filter((post) => post.user?.id === user.id);
    }, [allPosts, user]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Always fetch current user for comparison
                const currentUserData = await executeQuery(GRAPHQL_QUERIES.GET_CURRENT_USER, {});

                if (currentUserData) {
                    setCurrentUser(currentUserData.users.me);
                }

                // Fetch user details (either from userId param or current user)
                const userData = await executeQuery(
                    userId ? GRAPHQL_QUERIES.GET_USER_BY_ID : GRAPHQL_QUERIES.GET_CURRENT_USER,
                    userId ? { id: parseInt(userId) } : {}
                );

                if (!userData) {
                    console.error("User not found");
                    setLoading(false);
                    return;
                }

                const userInfo = userId ? userData.users.getuserbyid : userData.users.me;

                if (!userInfo) {
                    console.error("User not found");
                    setLoading(false);
                    return;
                }

                console.log('[ProfilePage] User info from GraphQL:', {
                    id: userInfo.id,
                    nickname: userInfo.nickname,
                    profilePic: userInfo.profilePic,
                    profilePicUrl: userInfo.profilePicUrl,
                    bannerPic: userInfo.bannerPic,
                    bannerPicUrl: userInfo.bannerPicUrl
                });

                setUser({
                    id: userInfo.id,
                    name: userInfo.name,
                    surname: userInfo.surname,
                    handle: `@${userInfo.nickname}`,
                    bio: "Professional developer", // TODO: Add bio field to backend
                    banner: userInfo.bannerPicUrl || userInfo.bannerPic || `https://picsum.photos/900/200?random=${userInfo.id}`,
                    pfp: userInfo.profilePicUrl || userInfo.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${userInfo.nickname}`,
                    abt: `Member since ${new Date(userInfo.joined).toLocaleDateString()}`
                });

                // Fetch user's projects
                const projectsData = await executeQuery(GRAPHQL_QUERIES.GET_USER_PROJECTS, {
                    userId: userInfo.id
                });

                if (projectsData) {
                    const projects = projectsData.project.userprojects || [];
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

    // Fetch owned projects when viewing someone else's profile
    useEffect(() => {
        if (!currentUser || !user || currentUser.id === user.id) return;

        const fetchOwnedProjects = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_PROJECTS, {});
                const myProjects = data.project.myprojects || [];
                
                // Filter to only projects where current user is owner
                const owned = myProjects.filter(p => p.owner.id === currentUser.id);
                console.log(`[ProfilePage] Current user owns ${owned.length} projects:`, owned.map(p => ({ id: p.id, name: p.name })));
                setOwnedProjects(owned);
            } catch (err) {
                console.error("Failed to fetch owned projects:", err);
            }
        };

        const fetchUserProjects = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_USER_PROJECTS, {
                    userId: user.id
                });
                const projects = data.project.userprojects || [];
                
                // Store project IDs the user is already a member of
                const projectIds = new Set(projects.map(p => p.id));
                console.log(`[ProfilePage] User ${user.id} (${user.name}) belongs to ${projectIds.size} projects:`, Array.from(projectIds));
                console.log('[ProfilePage] Full project details:', projects.map(p => ({ id: p.id, name: p.name })));
                setUserProjectIds(projectIds);
            } catch (err) {
                console.error("Failed to fetch user projects:", err);
            }
        };

        const checkIfFriend = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_FRIENDS, {});
                const friends = data.friendship.myfriends || [];
                
                // Check if the viewed user is in the friends list
                const friendExists = friends.some(friend => friend.id === user.id);
                setIsFriend(friendExists);
            } catch (err) {
                console.error("Failed to fetch friends:", err);
                setIsFriend(false);
            }
        };

        fetchOwnedProjects();
        fetchUserProjects();
        checkIfFriend();
    }, [currentUser, user, executeQuery]);

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
                                    style={{ height: "20px", width: "150px", marginBottom: "10px" }}
                                ></div>
                                <div
                                    className="skeleton"
                                    style={{ height: "16px", width: "300px" }}
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

    if (!user) {
        return (
            <div className="profile-layout">
                <Navbar />
                <div className="profile-content">
                    <Sidebar />
                    <div className="profile-main">
                        <p>User not found</p>
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
                    <ProfileBanner src={user.banner} alt="Banner" />

                    <div className="profile-header">
                        <img src={user.pfp} alt="Profile" className="profile-pfp" />
                        <div className="profile-info">
                            <h2>
                                {user.name} {user.surname}
                            </h2>
                            <p className="username">{user.handle}</p>
                            <p className="bio">{user.bio}</p>
                            {currentUser && user.id === currentUser.id && (
                                <button
                                    className="edit-btn"
                                    onClick={() => navigate("/profile/edit")}
                                >
                                    Edit Profile
                                </button>
                            )}
                            {currentUser && user.id !== currentUser.id && isFriend && ownedProjects.length > 0 && (
                                <button
                                    className="invite-btn"
                                    onClick={() => setShowInviteModal(true)}
                                >
                                    Invite to Project
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="profile-body">
                        <div className="profile-left">
                            <section className="about-me">
                                <h3>About Me</h3>
                                <p>{user.abt}</p>
                            </section>

                            <section className="owned-projects">
                                <h3>Part of projects</h3>
                                <div className="projects-scroll">
                                    {projects.length === 0 ? (
                                        <p>No projects yet</p>
                                    ) : (
                                        projects.map((proj) => (
                                            <div
                                                key={proj.id}
                                                className="project-card clickable"
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

                        <div className="profile-right">
                            <div className="profile-posts">
                                <h3>Activity</h3>
                                <div className="feed-container">
                                    {posts.length === 0 ? (
                                        <p>No posts yet</p>
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

                {/* Invite to Project Modal */}
                {showInviteModal && (
                    <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Invite {user.name} to a Project</h3>
                            <div className="project-list">
                                {ownedProjects.length === 0 ? (
                                    <p>You don't own any projects yet.</p>
                                ) : (
                                    ownedProjects.map((project) => {
                                        const isAlreadyMember = userProjectIds.has(project.id);
                                        console.log(`[ProfilePage Modal] Project ${project.id} "${project.name}": isAlreadyMember = ${isAlreadyMember}, userProjectIds =`, Array.from(userProjectIds));
                                        return (
                                            <div key={project.id} className="project-invite-item">
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
                                className="close-modal-btn"
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
