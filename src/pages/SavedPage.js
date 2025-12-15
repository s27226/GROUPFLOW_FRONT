import Layout from "../components/Layout";
import Post from "../components/Post";
import SkeletonPost from "../components/ui/SkeletonPost";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useSavedPosts } from "../hooks/usePosts";
import { useGraphQL } from "../hooks/useGraphQL";

export default function SavedPage() {
    const { posts, setPosts, loading, error, refetch: fetchSavedPosts } = useSavedPosts();
    const { executeQuery } = useGraphQL();

    const handleSavePost = async (postId) => {
        const post = posts.find((p) => p.id === postId);
        const isSaved = post?.saved;

        try {
            const mutation = isSaved ? GRAPHQL_MUTATIONS.UNSAVE_POST : GRAPHQL_MUTATIONS.SAVE_POST;

            await executeQuery(mutation, { postId });

            // If unsaving from the saved page, remove the post
            if (isSaved) {
                setPosts(posts.filter((p) => p.id !== postId));
            }
        } catch (err) {
            console.error("Error toggling save status:", err);
            alert("Failed to update save status. Please try again.");
        }
    };

    const handleHidePost = (postId) => {
        setPosts(posts.map((post) => (post.id === postId ? { ...post, hidden: true } : post)));
    };

    const handleUndoHide = (postId) => {
        setPosts(posts.map((post) => (post.id === postId ? { ...post, hidden: false } : post)));
    };

    const visiblePosts = posts.filter((post) => !post.hidden);

    if (loading) {
        return (
            <Layout variant="main">
                <div className="feed-container">
                    <h2 style={{ marginBottom: "20px", fontSize: "1.5rem", marginTop: "0" }}>
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
                <div className="feed-container">
                    <h2 style={{ marginBottom: "20px", fontSize: "1.5rem", marginTop: "0" }}>
                        Saved Posts
                    </h2>
                    <p
                        style={{
                            textAlign: "center",
                            color: "var(--error, red)",
                            marginTop: "40px"
                        }}
                    >
                        Error: {error}
                    </p>
                    <button
                        onClick={fetchSavedPosts}
                        style={{
                            display: "block",
                            margin: "20px auto",
                            padding: "10px 20px",
                            background: "var(--accent)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                    >
                        Retry
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout variant="main">
            <div className="feed-container">
                <h2 style={{ marginBottom: "20px", fontSize: "1.5rem", marginTop: "0" }}>
                    Saved Posts
                </h2>
                {visiblePosts.length === 0 ? (
                    <p
                        style={{
                            textAlign: "center",
                            color: "var(--text-secondary)",
                            marginTop: "40px"
                        }}
                    >
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
                            saved={post.saved}
                            hidden={post.hidden}
                            sharedPost={post.sharedPost}
                            onHide={handleHidePost}
                            onUndoHide={handleUndoHide}
                            onSave={handleSavePost}
                        />
                    ))
                )}
            </div>
        </Layout>
    );
}
