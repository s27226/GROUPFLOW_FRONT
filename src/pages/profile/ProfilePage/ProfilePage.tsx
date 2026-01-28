import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Sidebar } from "../../../components/layout";
import { Post } from "../../../components/feed";
import { ProfileBanner } from "../../../components/profile";
import SkeletonPost from "../../../components/ui/SkeletonPost";
import SkeletonCard from "../../../components/ui/SkeletonCard";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useNavigate, useParams } from "react-router-dom";
import { usePosts, useGraphQL, useFriends, useMyProjects, useUserProjects, useUserProfile } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { translateError } from "../../../utils/errorTranslation";
import { sanitizeText } from "../../../utils/sanitize";
import { getProjectImageUrl } from "../../../utils/profilePicture";
import styles from "./ProfilePage.module.css";
import feedStyles from "../../../components/feed/Feed/Feed.module.css";

interface ProfileProject {
    id: string;
    name: string;
    description: string;
    image: string;
}

interface ProjectQueryResponse {
    project?: {
        userprojects?: Array<{
            id: string;
            name: string;
            description?: string;
            imageUrl?: string;
        }>;
    };
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth(); // Renamed to currentUser from authUser
    const { executeQuery, executeMutation } = useGraphQL();
    const { showToast } = useToast();

    // Use the new unified useUserProfile hook
    const { user, loading: userLoading } = useUserProfile(userId);
    
    const [projects, setProjects] = useState<ProfileProject[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviting, setInviting] = useState(false);

    // Use unified hooks
    const { friends: myFriends } = useFriends({ autoFetch: !!currentUser });
    const { projects: myProjects } = useMyProjects({ autoFetch: !!currentUser });
    const { projects: userProjects } = useUserProjects(user?.id ?? 0, { autoFetch: !!user });
    
    // Derive state from hooks
    const isFriend = useMemo(() => 
        (myFriends || []).some(friend => friend.id == user?.id),
        [myFriends, user]
    );
    
    const ownedProjects = useMemo(() => 
        (myProjects || []).filter(p => p.owner?.id === currentUser?.id),
        [myProjects, currentUser]
    );
    
    const userProjectIds = useMemo(() => 
        new Set((userProjects || []).map(p => p.id)),
        [userProjects]
    );

    const { posts: allPosts, loading: postsLoading } = usePosts();

    // Filter posts by current user
    const posts = useMemo(() => {
        if (!user || !allPosts) return [];
        return allPosts.filter((post) => post.user?.id === user.id);
    }, [allPosts, user]);

    // Fetch user's projects when user is loaded
    useEffect(() => {
        const fetchUserProjects = async () => {
            if (!user) return;
            
            try {
                const projectsData = await executeQuery<ProjectQueryResponse>(GRAPHQL_QUERIES.GET_USER_PROJECTS, {
                    userId: user.id
                });

                if (projectsData && projectsData.project) {
                    const fetchedProjects = projectsData.project?.userprojects || [];
                    setProjects(
                        fetchedProjects.map((project) => ({
                            id: project.id,
                            name: project.name,
                            description: project.description || '',
                            image: getProjectImageUrl(project.imageUrl, project.id, 60)
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to fetch user projects:", err);
            } finally {
                setProjectsLoading(false);
            }
        };

        fetchUserProjects();
    }, [user, executeQuery]);

    // Combined loading state
    const loading = userLoading || projectsLoading;

    const handleInviteToProject = async (projectId: string) => {
        if (!currentUser || !user) return;

        setInviting(true);
        try {
            const response = await executeMutation<{ errors?: Array<{ message: string }> }>(GRAPHQL_MUTATIONS.CREATE_PROJECT_INVITATION, {
                input: {
                    projectId: parseInt(projectId),
                    invitingId: currentUser.id,
                    invitedId: user.id
                }
            });

            if (response?.errors) {
                throw new Error(response.errors[0].message);
            }

            showToast(t('profile.invitationSent', { name: `${user.name} ${user.surname}` }), 'success');
            setShowInviteModal(false);
        } catch (err) {
            console.error("Failed to send invitation:", err);
            const errorMessage = translateError((err as Error)?.message, 'profile.invitationFailed');
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
                        <p>{t('profile.userNotFound')}</p>
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
                            {currentUser && user.id === currentUser.id && (
                                <button
                                    className={styles.editBtn}
                                    onClick={() => navigate("/profile/edit")}
                                >
                                    {t('profile.editProfile')}
                                </button>
                            )}
                            {currentUser && user.id !== currentUser.id && isFriend && ownedProjects.length > 0 && (
                                <button
                                    className={styles.inviteBtn}
                                    onClick={() => setShowInviteModal(true)}
                                >
                                    {t('profile.inviteToProject')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.profileBody}>
                        <div className={styles.profileLeft}>
                            <section className={styles.aboutMe}>
                                <h3>{t('profile.aboutMe')}</h3>
                                <p>{user.aboutMe}</p>
                            </section>

                            <section className={styles.ownedProjects}>
                                <h3>{t('profile.partOfProjects')}</h3>
                                <div className={styles.projectsScroll}>
                                    {projects.length === 0 ? (
                                        <p>{t('profile.noProjectsYet')}</p>
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
                                <h3>{t('profile.activity')}</h3>
                                <div className={feedStyles.feedContainer}>
                                    {posts.length === 0 ? (
                                        <p>{t('profile.noPostsYet')}</p>
                                    ) : (
                                        posts.map((post) => (
                                            <Post
                                                key={post.id}
                                                id={post.id}
                                                author={post.author}
                                                authorId={post.authorId ?? 0}
                                                authorProfilePic={post.authorProfilePic ?? undefined}
                                                time={post.time}
                                                content={post.content ?? ''}
                                                image={post.image}
                                                comments={post.comments?.map(c => ({
                                                    id: c.id,
                                                    userId: c.userId,
                                                    user: c.user,
                                                    profilePic: c.profilePic,
                                                    text: c.text,
                                                    time: c.time,
                                                    likes: c.likes || [],
                                                    liked: c.liked,
                                                    menuOpen: c.menuOpen,
                                                    replies: []
                                                })) || []}
                                                saved={false}
                                                sharedPost={post.sharedPost ? {
                                                    id: post.sharedPost.id,
                                                    author: post.sharedPost.author,
                                                    authorId: post.sharedPost.authorId,
                                                    authorProfilePic: post.sharedPost.authorProfilePic,
                                                    time: post.sharedPost.time,
                                                    content: post.sharedPost.content ?? '',
                                                    image: post.sharedPost.image
                                                } : null}
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
                            <h3>{t('profile.inviteUserToProject', { name: user.name })}</h3>
                            <div className={styles.projectList}>
                                {ownedProjects.length === 0 ? (
                                    <p>{t('profile.noOwnedProjects')}</p>
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
                                                            ℹ {t('profile.alreadyMember')}
                                                        </small>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleInviteToProject(String(project.id))}
                                                    disabled={inviting || isAlreadyMember}
                                                    style={{
                                                        opacity: isAlreadyMember ? 0.5 : 1,
                                                        cursor: isAlreadyMember ? 'not-allowed' : 'pointer',
                                                        backgroundColor: isAlreadyMember ? '#ccc' : ''
                                                    }}
                                                >
                                                    {isAlreadyMember ? t('profile.member') : inviting ? t('profile.inviting') : t('profile.invite')}
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
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
