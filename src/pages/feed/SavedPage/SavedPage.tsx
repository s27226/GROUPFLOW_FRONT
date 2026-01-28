import { useTranslation } from "react-i18next";
import { Layout } from "../../../components/layout";
import { Post } from "../../../components/feed";
import SkeletonPost from "../../../components/ui/SkeletonPost";
import { useSavedPosts } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { translateError } from "../../../utils/errorTranslation";
import styles from "./SavedPage.module.css";

export default function SavedPage() {
    const { t } = useTranslation();
    const { posts, setPosts, loading, error, refetch: fetchSavedPosts } = useSavedPosts();
    const { showToast } = useToast();

    // This is called AFTER Post.jsx handles the mutation
    // Just update the local list state
    const handleSavePost = (postId: number) => {
        // Remove the post from the saved list since it was unsaved
        setPosts(prev => prev ? prev.filter((p) => p.id !== postId) : []);
    };

    const visiblePosts = posts ? posts.filter((post) => !post.hidden) : [];

    if (loading) {
        return (
            <Layout variant="main">
                <div className={styles.feedContainer}>
                    <h2 className={styles.pageTitle}>
                        {t('feed.savedPosts')}
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
                        {t('feed.savedPosts')}
                    </h2>
                    <p className={styles.errorMessage}>
                        {translateError(error, 'common.errorOccurred')}
                    </p>
                    <button
                        onClick={() => fetchSavedPosts()}
                        className={styles.retryBtn}
                    >
                        {t('common.retry')}
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout variant="main">
            <div className={styles.feedContainer}>
                <h2 className={styles.pageTitle}>
                    {t('feed.savedPosts')}
                </h2>
                {visiblePosts.length === 0 ? (
                    <p className={styles.emptyMessage}>
                        {t('feed.noSavedPosts')}
                    </p>
                ) : (
                    visiblePosts.map((post) => (
                        <Post
                            key={post.id}
                            id={post.id}
                            author={post.author}
                            authorId={post.authorId ?? 0}
                            authorProfilePic={post.authorProfilePic}
                            time={post.time ?? ''}
                            content={post.content ?? ''}
                            image={post.image}
                            comments={(post.comments ?? []).map((c) => ({
                                id: c.id,
                                user: c.user,
                                userId: c.userId,
                                profilePic: c.profilePic,
                                time: c.time,
                                text: c.text,
                                likes: c.likes ?? [],
                                liked: c.liked,
                                menuOpen: c.menuOpen,
                                replies: (c.replies ?? []).map((r) => ({
                                    id: r.id,
                                    user: r.user,
                                    userId: r.userId,
                                    profilePic: r.profilePic,
                                    time: r.time,
                                    text: r.text,
                                    likes: r.likes ?? [],
                                    liked: r.liked,
                                    menuOpen: r.menuOpen,
                                    replies: []
                                }))
                            }))}
                            likes={post.likes ?? []}
                            saved={post.saved}
                            hidden={post.hidden}
                            sharedPost={post.sharedPost ? {
                                id: post.sharedPost.id,
                                author: post.sharedPost.author,
                                authorId: post.sharedPost.authorId,
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
