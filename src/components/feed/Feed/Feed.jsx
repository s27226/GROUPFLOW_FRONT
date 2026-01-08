import { useEffect, useState, useCallback } from "react";
import Post from "../Post";
import SkeletonPost from "../../ui/SkeletonPost";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { usePosts } from "../../../hooks/usePosts";
import { useGraphQL } from "../../../hooks/useGraphQL";
import { useToast } from "../../../context/ToastContext";

export default function Feed() {
    const { posts, loading, error } = usePosts();
    const [savedPostIds, setSavedPostIds] = useState(new Set());
    const { executeQuery } = useGraphQL();
    const { showToast } = useToast();

    const fetchSavedPosts = useCallback(async () => {
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_SAVED_POSTS);

            const savedPosts = data?.savedPost?.savedposts || [];
            setSavedPostIds(new Set(savedPosts.map((post) => post.id)));
        } catch (err) {
            console.error("Failed to fetch saved posts:", err);
        }
    }, [executeQuery]);

    useEffect(() => {
        fetchSavedPosts();
    }, [fetchSavedPosts]);

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
            showToast("Failed to update save status. Please try again.", "error");
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
                        author={post.author}
                        authorId={post.authorId}
                        authorProfilePic={post.authorProfilePic}
                        time={post.time}
                        content={post.content}
                        title={post.title}
                        image={post.image}
                        saved={savedPostIds.has(post.id)}
                        sharedPost={post.sharedPost}
                        likes={post.likes || []}
                        comments={post.comments || []}
                        onSave={handleSavePost}
                    />
                ))
            )}
        </div>
    );
}
