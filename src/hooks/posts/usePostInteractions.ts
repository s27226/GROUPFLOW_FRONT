import { useCallback } from "react";
import { useGraphQL } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_MUTATIONS } from "../../queries/graphql";

interface PostUser {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface PostLike {
    userId: number;
    userName?: string;
}

interface PostComment {
    id: number;
    userId: number;
    content: string;
    createdAt?: string;
    likes?: PostLike[];
    user?: PostUser;
}

interface Post {
    id: number;
    user?: PostUser;
    likes?: PostLike[];
}

interface AddCommentVariables {
    postId: number;
    content: string;
    parentCommentId?: number;
    [key: string]: unknown;
}

/**
 * Custom hook for post interactions (like, unlike, comment, save, share, delete)
 * @returns {Object} Post interaction methods
 */
export const usePostInteractions = () => {
    const { executeMutation } = useGraphQL();
    const { user } = useAuth();

    /**
     * Like a post
     * @param {number} postId - ID of the post to like
     * @returns {Promise<Object>} Like object from mutation
     */
    const likePost = useCallback(async (postId: number | string) => {
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.LIKE_POST, { 
                postId: parseInt(String(postId)) 
            }) as { post?: { likePost?: PostLike } } | null;
            return response?.post?.likePost || null;
        } catch (error) {
            console.error("Failed to like post:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Unlike a post
     * @param {number} postId - ID of the post to unlike
     * @returns {Promise<boolean>} Success status
     */
    const unlikePost = useCallback(async (postId: number | string): Promise<boolean> => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.UNLIKE_POST, { 
                postId: parseInt(String(postId)) 
            });
            return true;
        } catch (error) {
            console.error("Failed to unlike post:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Add a comment to a post
     * @param {number} postId - ID of the post
     * @param {string} content - Comment content
     * @param {number} parentCommentId - Optional parent comment ID for replies
     * @returns {Promise<Object>} Comment object from mutation
     */
    const addComment = useCallback(async (postId: number | string, content: string, parentCommentId: number | string | null = null) => {
        if (!content || !content.trim()) {
            throw new Error("Comment content cannot be empty");
        }

        try {
            const variables: AddCommentVariables = {
                postId: parseInt(String(postId)),
                content: content.trim()
            };
            if (parentCommentId) {
                variables.parentCommentId = parseInt(String(parentCommentId));
            }
            const response = await executeMutation(GRAPHQL_MUTATIONS.ADD_COMMENT, variables) as { post?: { addComment?: PostComment } } | null;
            return response?.post?.addComment || null;
        } catch (error) {
            console.error("Failed to add comment:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Reply to a comment
     * @param {number} postId - ID of the post
     * @param {string} content - Reply content
     * @param {number} parentCommentId - ID of the parent comment
     * @returns {Promise<Object>} Reply object from mutation
     */
    const replyToComment = useCallback(async (postId: number | string, content: string, parentCommentId: number | string) => {
        if (!content || !content.trim()) {
            throw new Error("Reply content cannot be empty");
        }

        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.ADD_COMMENT, {
                postId: parseInt(String(postId)),
                content: content.trim(),
                parentCommentId: parseInt(String(parentCommentId))
            }) as { post?: { addComment?: PostComment } } | null;
            return response?.post?.addComment || null;
        } catch (error) {
            console.error("Failed to reply to comment:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Like a comment
     * @param {number} commentId - ID of the comment to like
     * @returns {Promise<Object>} Like object from mutation
     */
    const likeComment = useCallback(async (commentId: number | string) => {
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.LIKE_COMMENT, {
                commentId: parseInt(String(commentId))
            }) as { post?: { likeComment?: PostLike } } | null;
            return response?.post?.likeComment || null;
        } catch (error) {
            console.error("Failed to like comment:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Unlike a comment
     * @param {number} commentId - ID of the comment to unlike
     * @returns {Promise<boolean>} Success status
     */
    const unlikeComment = useCallback(async (commentId: number | string): Promise<boolean> => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.UNLIKE_COMMENT, {
                commentId: parseInt(String(commentId))
            });
            return true;
        } catch (error) {
            console.error("Failed to unlike comment:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Delete a post
     * @param {number} postId - ID of the post to delete
     * @returns {Promise<boolean>} Success status
     */
    const deletePost = useCallback(async (postId: number | string): Promise<boolean> => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.DELETE_POST, {
                postId: parseInt(String(postId))
            });
            return true;
        } catch (error) {
            console.error("Failed to delete post:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Delete a comment
     * @param {number} commentId - ID of the comment to delete
     * @returns {Promise<boolean>} Success status
     */
    const deleteComment = useCallback(async (commentId: number | string): Promise<boolean> => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.DELETE_COMMENT, {
                commentId: parseInt(String(commentId))
            });
            return true;
        } catch (error) {
            console.error("Failed to delete comment:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Save a post
     * @param {number} postId - ID of the post to save
     * @returns {Promise<Object>} Saved post object
     */
    const savePost = useCallback(async (postId: number | string) => {
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.SAVE_POST, {
                postId: parseInt(String(postId))
            }) as { savedPost?: { savePost?: unknown } } | null;
            return response?.savedPost?.savePost || null;
        } catch (error) {
            console.error("Failed to save post:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Unsave a post
     * @param {number} postId - ID of the post to unsave
     * @returns {Promise<boolean>} Success status
     */
    const unsavePost = useCallback(async (postId: number | string): Promise<boolean> => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.UNSAVE_POST, {
                postId: parseInt(String(postId))
            });
            return true;
        } catch (error) {
            console.error("Failed to unsave post:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Check if current user has liked a post
     * @param {Object} post - Post object with likes array
     * @returns {boolean} True if user has liked the post
     */
    const isLikedByUser = useCallback((post: Post | null): boolean => {
        if (!user || !post || !post.likes) return false;
        return post.likes.some((like: PostLike) => String(like.userId) === String(user.id));
    }, [user]);

    /**
     * Check if current user has liked a comment
     * @param {Object} comment - Comment object with likes array
     * @returns {boolean} True if user has liked the comment
     */
    const isCommentLikedByUser = useCallback((comment: PostComment | null): boolean => {
        if (!user || !comment || !comment.likes) return false;
        return comment.likes.some((like: PostLike) => String(like.userId) === String(user.id));
    }, [user]);

    /**
     * Check if current user owns a post
     * @param {Object} post - Post object
     * @returns {boolean} True if user owns the post
     */
    const isOwnPost = useCallback((post: Post | null): boolean => {
        if (!user || !post || !post.user) return false;
        return String(post.user.id) === String(user.id);
    }, [user]);

    /**
     * Check if current user owns a comment
     * @param {Object} comment - Comment object
     * @returns {boolean} True if user owns the comment
     */
    const isOwnComment = useCallback((comment: PostComment | null): boolean => {
        if (!user || !comment || !comment.user) return false;
        return String(comment.user.id) === String(user.id);
    }, [user]);

    return {
        // Like/Unlike
        likePost,
        unlikePost,
        
        // Comments
        addComment,
        replyToComment,
        likeComment,
        unlikeComment,
        deleteComment,
        
        // Post actions
        deletePost,
        savePost,
        unsavePost,
        
        // Helpers
        isLikedByUser,
        isCommentLikedByUser,
        isOwnPost,
        isOwnComment
    };
};
