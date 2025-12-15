import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import ProfileBanner from "../components/ProfileBanner";
import SkeletonPost from "../components/ui/SkeletonPost";
import SkeletonCard from "../components/ui/SkeletonCard";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useNavigate, useParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { useAuth } from "../context/AuthContext";
import { useGraphQL } from "../hooks/useGraphQL";
import "../styles/ProfilePage.css";
import "../styles/feed.css";

export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { executeQuery } = useGraphQL();

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

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

                setUser({
                    id: userInfo.id,
                    name: userInfo.name,
                    surname: userInfo.surname,
                    handle: `@${userInfo.nickname}`,
                    bio: "Professional developer", // TODO: Add bio field to backend
                    banner: `https://picsum.photos/900/200?random=${userInfo.id}`,
                    pfp: `https://api.dicebear.com/9.x/identicon/svg?seed=${userInfo.nickname}`,
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
        </div>
    );
}
