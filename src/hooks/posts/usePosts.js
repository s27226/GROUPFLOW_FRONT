import { GRAPHQL_QUERIES } from "../../queries/graphql";
import { formatTime } from "../../utils/dateFormatter";
import { useQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";

/**
 * Helper function to format comment data
 * @param {Object} comment - Raw comment data from API
 * @returns {Object} Formatted comment data
 */
const formatCommentData = (comment) => {
    if (!comment) return null;
    
    return {
        id: comment.id,
        user: comment.user?.nickname || `${comment.user?.name || ''} ${comment.user?.surname || ''}`.trim() || "Unknown",
        userId: comment.userId,
        profilePic: comment.user?.profilePic,
        time: formatTime(comment.createdAt),
        text: comment.content,
        likes: comment.likes || [],
        liked: false,
        menuOpen: false,
        replies: comment.replies ? comment.replies.map(formatCommentData) : []
    };
};

/**
 * Helper function to format post data with sharedPost
 * @param {Object} post - Raw post data from API
 * @returns {Object} Formatted post data
 */
export const formatPostData = (post) => {
    if (!post) return null;

    return {
        ...post,
        author: post.user?.nickname || "Unknown",
        authorId: post.user?.id,
        authorProfilePic: post.user?.profilePic,
        time: formatTime(post.created),
        content: post.content || post.description,
        image: post.imageUrl,
        likes: post.likes || [],
        comments: post.comments ? post.comments.map(formatCommentData) : [],
        sharedPost: post.sharedPost
            ? {
                  id: post.sharedPost.id,
                  author: post.sharedPost.user?.nickname || "Unknown",
                  authorId: post.sharedPost.user?.id,
                  authorProfilePic: post.sharedPost.user?.profilePic,
                  time: formatTime(post.sharedPost.created),
                  content: post.sharedPost.content || post.sharedPost.description,
                  image: post.sharedPost.imageUrl
              }
            : null
    };
};

/**
 * Custom hook to fetch all posts
 * Uses useQuery for unified loading/error state management
 * @returns {Object} { posts, loading, error, refetch }
 */
export const usePosts = () => {
    const { isAuthenticated, authLoading } = useAuth();
    
    const { data, loading, error, refetch, setData } = useQuery(
        GRAPHQL_QUERIES.GET_POSTS,
        {},
        {
            skip: authLoading || !isAuthenticated,
            autoFetch: true,
            initialData: [],
            transform: (data) => {
                const allPosts = data?.post?.allposts || [];
                return allPosts.map(formatPostData);
            }
        }
    );

    return { posts: data, loading, error, refetch, setPosts: setData };
};

/**
 * Custom hook to fetch a single post by ID
 * Uses useQuery for unified loading/error state management
 * @param {number|string} postId - The ID of the post to fetch
 * @returns {Object} { post, loading, error, refetch }
 */
export const usePost = (postId) => {
    const { isAuthenticated, authLoading } = useAuth();
    
    const { data, loading, error, refetch } = useQuery(
        GRAPHQL_QUERIES.GET_POSTS,
        {},
        {
            skip: authLoading || !isAuthenticated || !postId,
            autoFetch: true,
            initialData: null,
            transform: (data) => {
                const allPosts = data?.post?.allposts || [];
                const foundPost = allPosts.find((p) => p.id === parseInt(postId));
                return foundPost ? formatPostData(foundPost) : null;
            }
        }
    );

    return { post: data, loading, error, refetch };
};

/**
 * Custom hook to fetch posts for a specific project
 * Uses useQuery for unified loading/error state management
 * @param {number|string} projectId - The ID of the project
 * @returns {Object} { posts, loading, error, refetch }
 */
export const useProjectPosts = (projectId) => {
    const { isAuthenticated, authLoading } = useAuth();
    
    const { data, loading, error, refetch } = useQuery(
        GRAPHQL_QUERIES.GET_PROJECT_POSTS,
        { projectId: parseInt(projectId) },
        {
            skip: authLoading || !isAuthenticated || !projectId,
            autoFetch: true,
            initialData: [],
            transform: (data) => {
                const projectPosts = data?.project?.projectposts || [];
                return projectPosts.map(formatPostData);
            }
        }
    );

    return { posts: data, loading, error, refetch };
};

/**
 * Custom hook to fetch saved posts
 * Uses useQuery for unified loading/error state management
 * @returns {Object} { posts, loading, error, refetch }
 */
export const useSavedPosts = () => {
    const { isAuthenticated, authLoading } = useAuth();
    
    const { data, loading, error, refetch, setData } = useQuery(
        GRAPHQL_QUERIES.GET_SAVED_POSTS,
        {},
        {
            skip: authLoading || !isAuthenticated,
            autoFetch: true,
            initialData: [],
            transform: (data) => {
                const savedPosts = data?.savedPost?.savedposts || [];
                return savedPosts.map((post) => ({
                    ...formatPostData(post),
                    saved: true,
                    hidden: false
                }));
            }
        }
    );

    return { posts: data, setPosts: setData, loading, error, refetch };
};
