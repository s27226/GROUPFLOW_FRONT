import { useEffect, useState, useCallback } from "react";
import Post from "../Post";
import SkeletonPost from "../../ui/SkeletonPost";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { usePosts, useGraphQL } from "../../../hooks";
import styles from "./Feed.module.css";

export default function Feed() {
    const { posts, loading, error } = usePosts();
    const [savedPostIds, setSavedPostIds] = useState(new Set());
    const { executeQuery } = useGraphQL();

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

    // This is called AFTER Post.jsx handles the mutation
    // Just update the local saved state tracking
    const handleSavePost = (postId) => {
        setSavedPostIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    return (
        <div className={styles.feedContainer}>
            {loading ? (
                <SkeletonPost count={3} />
            ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
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
