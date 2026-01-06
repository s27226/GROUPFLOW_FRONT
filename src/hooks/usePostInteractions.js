import { useCallback } from "react";
import { useGraphQL } from "./useGraphQL";
import { useAuth } from "../context/AuthContext";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";

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
    const likePost = useCallback(async (postId) => {
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.LIKE_POST, { 
                postId: parseInt(postId) 
            });
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
    const unlikePost = useCallback(async (postId) => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.UNLIKE_POST, { 
                postId: parseInt(postId) 
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
     * @returns {Promise<Object>} Comment object from mutation
     */
    const addComment = useCallback(async (postId, content) => {
        if (!content || !content.trim()) {
            throw new Error("Comment content cannot be empty");
        }

        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.CREATE_COMMENT, {
                input: {
                    postId: parseInt(postId),
                    content: content.trim()
                }
            });
            return response?.comment?.createComment || null;
        } catch (error) {
            console.error("Failed to add comment:", error);
            throw error;
        }
    }, [executeMutation]);

    /**
     * Reply to a comment
     * @param {number} commentId - ID of the parent comment
     * @param {string} content - Reply content
     * @returns {Promise<Object>} Reply object from mutation
     */
    const replyToComment = useCallback(async (commentId, content) => {
        if (!content || !content.trim()) {
            throw new Error("Reply content cannot be empty");
        }

        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.REPLY_TO_COMMENT, {
                input: {
                    parentCommentId: parseInt(commentId),
                    content: content.trim()
                }
            });
            return response?.comment?.replyToComment || null;
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
    const likeComment = useCallback(async (commentId) => {
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.LIKE_COMMENT, {
                commentId: parseInt(commentId)
            });
            return response?.comment?.likeComment || null;
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
    const unlikeComment = useCallback(async (commentId) => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.UNLIKE_COMMENT, {
                commentId: parseInt(commentId)
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
    const deletePost = useCallback(async (postId) => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.DELETE_POST, {
                postId: parseInt(postId)
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
    const deleteComment = useCallback(async (commentId) => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.DELETE_COMMENT, {
                commentId: parseInt(commentId)
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
    const savePost = useCallback(async (postId) => {
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.SAVE_POST, {
                postId: parseInt(postId)
            });
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
    const unsavePost = useCallback(async (postId) => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.UNSAVE_POST, {
                postId: parseInt(postId)
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
    const isLikedByUser = useCallback((post) => {
        if (!user || !post || !post.likes) return false;
        return post.likes.some(like => like.userId === user.id);
    }, [user]);

    /**
     * Check if current user has liked a comment
     * @param {Object} comment - Comment object with likes array
     * @returns {boolean} True if user has liked the comment
     */
    const isCommentLikedByUser = useCallback((comment) => {
        if (!user || !comment || !comment.likes) return false;
        return comment.likes.some(like => like.userId === user.id);
    }, [user]);

    /**
     * Check if current user owns a post
     * @param {Object} post - Post object
     * @returns {boolean} True if user owns the post
     */
    const isOwnPost = useCallback((post) => {
        if (!user || !post || !post.user) return false;
        return post.user.id === user.id;
    }, [user]);

    /**
     * Check if current user owns a comment
     * @param {Object} comment - Comment object
     * @returns {boolean} True if user owns the comment
     */
    const isOwnComment = useCallback((comment) => {
        if (!user || !comment || !comment.user) return false;
        return comment.user.id === user.id;
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
