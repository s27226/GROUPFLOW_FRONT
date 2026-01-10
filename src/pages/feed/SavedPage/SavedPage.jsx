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
    const handleSavePost = (postId) => {
        // Remove the post from the saved list since it was unsaved
        setPosts(prev => prev.filter((p) => p.id !== postId));
    };

    const visiblePosts = posts.filter((post) => !post.hidden);

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
                        onClick={fetchSavedPosts}
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
                            id={post.id}
                            author={post.author}
                            authorId={post.authorId}
                            time={post.time}
                            content={post.content}
                            image={post.image}
                            comments={post.comments}
                            likes={post.likes}
                            saved={post.saved}
                            hidden={post.hidden}
                            sharedPost={post.sharedPost}
                            onSave={handleSavePost}
                        />
                    ))
                )}
            </div>
        </Layout>
    );
}
