import { useEffect, useState, useCallback } from "react";
import Post from "../Post";
import SkeletonPost from "../../ui/SkeletonPost";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import { usePosts, useGraphQL } from "../../../hooks";
import styles from "./Feed.module.css";

interface SavedPostResponse {
    savedPost?: {
        savedposts?: Array<{ id: number | string }>;
    };
}

export default function Feed() {
    const { posts, loading, error } = usePosts();
    const [savedPostIds, setSavedPostIds] = useState<Set<number>>(new Set());
    const { executeQuery } = useGraphQL();

    const fetchSavedPosts = useCallback(async () => {
        try {
            const data = await executeQuery<SavedPostResponse>(GRAPHQL_QUERIES.GET_SAVED_POSTS);

            const savedPosts = data?.savedPost?.savedposts || [];
            setSavedPostIds(new Set(savedPosts.map((post) => typeof post.id === 'number' ? post.id : parseInt(String(post.id), 10))));
        } catch (err) {
            console.error("Failed to fetch saved posts:", err);
        }
    }, [executeQuery]);

    useEffect(() => {
        fetchSavedPosts();
    }, [fetchSavedPosts]);

    // This is called AFTER Post.jsx handles the mutation
    // Just update the local saved state tracking
    const handleSavePost = (postId: number) => {
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
                posts && posts.map((post) => (
                    <Post
                        key={post.id}
                        id={post.id}
                        author={post.author}
                        authorId={post.authorId || 0}
                        authorProfilePic={post.authorProfilePic}
                        time={post.time}
                        content={post.content || ''}
                        image={post.image}
                        saved={savedPostIds.has(post.id)}
                        sharedPost={post.sharedPost ? {
                            id: post.sharedPost.id,
                            author: post.sharedPost.author,
                            authorId: post.sharedPost.authorId,
                            authorProfilePic: post.sharedPost.authorProfilePic,
                            time: post.sharedPost.time,
                            content: post.sharedPost.content || '',
                            image: post.sharedPost.image
                        } : null}
                        likes={post.likes || []}
                        comments={(post.comments || []).map(comment => ({
                            id: comment.id,
                            user: comment.user,
                            userId: comment.userId,
                            profilePic: comment.profilePic,
                            time: comment.time,
                            text: comment.text,
                            likes: comment.likes || [],
                            liked: comment.liked,
                            menuOpen: comment.menuOpen,
                            replies: (comment.replies || []).map(reply => ({
                                id: reply.id,
                                user: reply.user,
                                userId: reply.userId,
                                profilePic: reply.profilePic,
                                time: reply.time,
                                text: reply.text,
                                likes: reply.likes || [],
                                liked: reply.liked,
                                menuOpen: reply.menuOpen,
                                replies: []
                            }))
                        }))}
                        onSave={handleSavePost}
                        onUpdate={() => {}}
                    />
                ))
            )}
        </div>
    );
}
