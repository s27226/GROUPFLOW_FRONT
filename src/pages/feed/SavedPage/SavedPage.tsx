import { Layout } from "../../../components/layout";
import { Post } from "../../../components/feed";
import SkeletonPost from "../../../components/ui/SkeletonPost";
import { useSavedPosts } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import styles from "./SavedPage.module.css";

export default function SavedPage() {
    const { posts, setPosts, loading, error, refetch: fetchSavedPosts } = useSavedPosts();
    const { showToast } = useToast();

    // This is called AFTER Post.jsx handles the mutation
    // Just update the local list state
    const handleSavePost = (postId: string) => {
        // Remove the post from the saved list since it was unsaved
        setPosts(prev => prev ? prev.filter((p) => String(p.id) !== postId) : []);
    };

    const visiblePosts = posts ? posts.filter((post) => !post.hidden) : [];

    if (loading) {
        return (
            <Layout variant="main">
                <div className={styles.feedContainer}>
                    <h2 className={styles.pageTitle}>
                        Saved Posts
                    </h2>
                    <SkeletonPost count={3} />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout variant="main">
                <div className={styles.feedContainer}>
                    <h2 className={styles.pageTitle}>
                        Saved Posts
                    </h2>
                    <p className={styles.errorMessage}>
                        Error: {error}
                    </p>
                    <button
                        onClick={() => fetchSavedPosts()}
                        className={styles.retryBtn}
                    >
                        Retry
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout variant="main">
            <div className={styles.feedContainer}>
                <h2 className={styles.pageTitle}>
                    Saved Posts
                </h2>
                {visiblePosts.length === 0 ? (
                    <p className={styles.emptyMessage}>
                        No saved posts yet
                    </p>
                ) : (
                    visiblePosts.map((post) => (
                        <Post
                            key={post.id}
                            id={String(post.id)}
                            author={post.author}
                            authorId={String(post.authorId ?? '')}
                            time={post.time ?? ''}
                            content={post.content ?? ''}
                            image={post.image}
                            comments={(post.comments ?? []).map((c) => ({
                                id: String(c.id),
                                user: c.user,
                                userId: String(c.userId),
                                profilePic: c.profilePic,
                                time: c.time,
                                text: c.text,
                                likes: (c.likes ?? []).map((l) => ({ userId: String(l.userId), userName: l.userName })),
                                liked: c.liked,
                                menuOpen: c.menuOpen,
                                replies: (c.replies ?? []).map((r) => ({
                                    id: String(r.id),
                                    user: r.user,
                                    userId: String(r.userId),
                                    profilePic: r.profilePic,
                                    time: r.time,
                                    text: r.text,
                                    likes: (r.likes ?? []).map((rl) => ({ userId: String(rl.userId), userName: rl.userName })),
                                    liked: r.liked,
                                    menuOpen: r.menuOpen,
                                    replies: []
                                }))
                            }))}
                            likes={(post.likes ?? []).map((l) => ({ userId: String(l.userId), userName: l.userName }))}
                            saved={post.saved}
                            hidden={post.hidden}
                            sharedPost={post.sharedPost ? {
                                id: String(post.sharedPost.id),
                                author: post.sharedPost.author,
                                authorId: post.sharedPost.authorId ? String(post.sharedPost.authorId) : undefined,
                                authorProfilePic: post.sharedPost.authorProfilePic,
                                time: post.sharedPost.time,
                                content: post.sharedPost.content ?? '',
                                image: post.sharedPost.image
                            } : null}
                            onSave={handleSavePost}
                        />
                    ))
                )}
            </div>
        </Layout>
    );
}
