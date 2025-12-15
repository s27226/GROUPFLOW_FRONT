import { useState, useEffect } from "react";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { formatTime } from "../utils/dateFormatter";
import { useGraphQL } from "./useGraphQL";

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
        time: formatTime(post.created),
        content: post.content || post.description,
        image: post.imageUrl,
        sharedPost: post.sharedPost
            ? {
                  id: post.sharedPost.id,
                  author: post.sharedPost.user?.nickname || "Unknown",
                  authorId: post.sharedPost.user?.id,
                  time: formatTime(post.sharedPost.created),
                  content: post.sharedPost.content || post.sharedPost.description,
                  image: post.sharedPost.imageUrl
              }
            : null
    };
};

/**
 * Custom hook to fetch all posts
 * @returns {Object} { posts, loading, error, refetch }
 */
export const usePosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await executeQuery(GRAPHQL_QUERIES.GET_POSTS, {});

            const allPosts = data.post.allposts || [];
            const formattedPosts = allPosts.map(formatPostData);
            setPosts(formattedPosts);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError(err.message || "Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return { posts, loading, error, refetch: fetchPosts };
};

/**
 * Custom hook to fetch a single post by ID
 * @param {number|string} postId - The ID of the post to fetch
 * @returns {Object} { post, loading, error, refetch }
 */
export const usePost = (postId) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchPost = async () => {
        if (!postId) {
            setError("No post ID provided");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await executeQuery(GRAPHQL_QUERIES.GET_POSTS, {});

            const allPosts = data.post.allposts || [];
            const foundPost = allPosts.find((p) => p.id === parseInt(postId));

            if (!foundPost) {
                setError("Post not found");
                setPost(null);
            } else {
                const formattedPost = formatPostData(foundPost);
                setPost({
                    ...formattedPost,
                    comments: []
                });
                setError(null);
            }
        } catch (err) {
            console.error("Failed to fetch post:", err);
            setError(err.message || "Failed to load post");
            setPost(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    return { post, loading, error, refetch: fetchPost };
};

/**
 * Custom hook to fetch posts for a specific project
 * @param {number|string} projectId - The ID of the project
 * @returns {Object} { posts, loading, error, refetch }
 */
export const useProjectPosts = (projectId) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchProjectPosts = async () => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT_POSTS, {
                projectId: parseInt(projectId)
            });

            const projectPosts = data.project.projectposts || [];
            const formattedPosts = projectPosts.map(formatPostData);
            setPosts(formattedPosts);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch project posts:", err);
            setError(err.message || "Failed to load project posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectPosts();
    }, [projectId]);

    return { posts, loading, error, refetch: fetchProjectPosts };
};

/**
 * Custom hook to fetch saved posts
 * @returns {Object} { posts, loading, error, refetch }
 */
export const useSavedPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            const data = await executeQuery(GRAPHQL_QUERIES.GET_SAVED_POSTS);

            const savedPosts = data?.savedPost?.savedposts || [];
            const formattedPosts = savedPosts.map((post) => ({
                ...formatPostData(post),
                saved: true,
                hidden: false,
                comments: []
            }));
            setPosts(formattedPosts);
            setError(null);
        } catch (err) {
            console.error("Error fetching saved posts:", err);
            setError(err.message || "Failed to load saved posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    return { posts, setPosts, loading, error, refetch: fetchSavedPosts };
};
