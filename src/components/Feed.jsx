import { useEffect, useState } from "react";
import Post from "./Post";
import SkeletonPost from "./ui/SkeletonPost";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import { usePosts } from "../hooks/usePosts";
import { useGraphQL } from "../hooks/useGraphQL";

export default function Feed() {
    const { posts, loading, error } = usePosts();
    const [savedPostIds, setSavedPostIds] = useState(new Set());
    const { executeQuery } = useGraphQL();

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    const fetchSavedPosts = async () => {
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_SAVED_POSTS);

            const savedPosts = data?.savedPost?.savedposts || [];
            setSavedPostIds(new Set(savedPosts.map((post) => post.id)));
        } catch (err) {
            console.error("Failed to fetch saved posts:", err);
        }
    };

    const handleHidePost = (postId) => {
        // TODO: Implement hide functionality with proper state management
        console.log("Hide post:", postId);
    };

    const handleUndoHide = (postId) => {
        // TODO: Implement undo hide functionality with proper state management
        console.log("Undo hide post:", postId);
    };

    const handleSavePost = async (postId) => {
        const isSaved = savedPostIds.has(postId);

        try {
            const mutation = isSaved ? GRAPHQL_MUTATIONS.UNSAVE_POST : GRAPHQL_MUTATIONS.SAVE_POST;

            await executeQuery(mutation, { postId });

            // Update local state
            setSavedPostIds((prev) => {
                const newSet = new Set(prev);
                if (isSaved) {
                    newSet.delete(postId);
                } else {
                    newSet.add(postId);
                }
                return newSet;
            });
        } catch (err) {
            console.error("Error toggling save status:", err);
            alert("Failed to update save status. Please try again.");
        }
    };

    return (
        <div className="feed-container">
            {loading ? (
                <SkeletonPost count={3} />
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : posts?.length === 0 ? (
                <p>No posts available. Be the first to create one!</p>
            ) : (
                posts.map((post) => (
                    <Post
                        key={post.id}
                        id={post.id}
                        author={post.user?.nickname || "Unknown"}
                        authorId={post.user?.id}
                        time={post.time}
                        content={post.content}
                        title={post.title}
                        image={post.imageUrl || null}
                        saved={savedPostIds.has(post.id)}
                        sharedPost={post.sharedPost}
                        onHide={handleHidePost}
                        onUndoHide={handleUndoHide}
                        onSave={handleSavePost}
                    />
                ))
            )}
        </div>
    );
}
