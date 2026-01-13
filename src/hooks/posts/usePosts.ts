import { GRAPHQL_QUERIES } from "../../queries/graphql";
import { formatTime } from "../../utils/dateFormatter";
import { useQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";

interface PostUser {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface PostLike {
    userId: number;
    userName?: string;
}

interface RawComment {
    id: number;
    userId: number;
    content: string;
    createdAt: string;
    likes?: PostLike[];
    user?: PostUser;
    replies?: RawComment[];
}

interface FormattedComment {
    id: number;
    user: string;
    userId: number;
    profilePic?: string;
    time: string;
    text: string;
    likes: PostLike[];
    liked: boolean;
    menuOpen: boolean;
    replies: FormattedComment[];
}

interface RawPost {
    id: number;
    content?: string;
    description?: string;
    imageUrl?: string;
    created: string;
    likes?: PostLike[];
    comments?: RawComment[];
    user?: PostUser;
    sharedPost?: RawPost | null;
    projectId?: number;
}

interface FormattedPost {
    id: number;
    author: string;
    authorId?: number;
    authorProfilePic?: string;
    time: string;
    content?: string;
    image?: string;
    likes: PostLike[];
    comments: FormattedComment[];
    sharedPost: FormattedSharedPost | null;
    user?: PostUser;
    description?: string;
    imageUrl?: string;
    created?: string;
    projectId?: number;
    saved?: boolean;
    hidden?: boolean;
}

interface FormattedSharedPost {
    id: number;
    author: string;
    authorId?: number;
    authorProfilePic?: string;
    time: string;
    content?: string;
    image?: string;
}

/**
 * Helper function to format comment data
 * @param {Object} comment - Raw comment data from API
 * @returns {Object} Formatted comment data
 */
const formatCommentData = (comment: RawComment | null): FormattedComment | null => {
    if (!comment) return null;
    
    const user = comment.user;
    const displayName = user?.nickname || `${user?.name || ''} ${user?.surname || ''}`.trim() || "Unknown";
    const seed = user?.nickname || user?.id || 'unknown';
    
    return {
        id: comment.id,
        user: displayName,
        userId: comment.userId,
        profilePic: user?.profilePicUrl || `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`,
        time: formatTime(comment.createdAt),
        text: comment.content,
        likes: comment.likes || [],
        liked: false,
        menuOpen: false,
        replies: comment.replies ? comment.replies.map(formatCommentData).filter((c): c is FormattedComment => c !== null) : []
    };
};

/**
 * Helper function to format post data with sharedPost
 * @param {Object} post - Raw post data from API
 * @returns {Object} Formatted post data
 */
export const formatPostData = (post: RawPost | null): FormattedPost | null => {
    if (!post) return null;

    const user = post.user;
    const authorSeed = user?.nickname || user?.id || 'unknown';
    
    const sharedUser = post.sharedPost?.user;
    const sharedAuthorSeed = sharedUser?.nickname || sharedUser?.id || 'unknown';

    return {
        ...post,
        author: user?.nickname || "Unknown",
        authorId: user?.id,
        authorProfilePic: user?.profilePicUrl || `https://api.dicebear.com/9.x/identicon/svg?seed=${authorSeed}`,
        time: formatTime(post.created),
        content: post.content || post.description,
        image: post.imageUrl,
        likes: post.likes || [],
        comments: post.comments ? post.comments.map(formatCommentData).filter((c): c is FormattedComment => c !== null) : [],
        sharedPost: post.sharedPost
            ? {
                  id: post.sharedPost.id,
                  author: sharedUser?.nickname || "Unknown",
                  authorId: sharedUser?.id,
                  authorProfilePic: sharedUser?.profilePicUrl || `https://api.dicebear.com/9.x/identicon/svg?seed=${sharedAuthorSeed}`,
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
    
    const { data, loading, error, refetch, setData } = useQuery<FormattedPost[]>(
        GRAPHQL_QUERIES.GET_POSTS,
        {},
        {
            skip: authLoading || !isAuthenticated,
            autoFetch: true,
            initialData: [],
            transform: (data: unknown): FormattedPost[] => {
                const typedData = data as { post?: { allposts?: RawPost[] } } | null;
                const allPosts = typedData?.post?.allposts || [];
                return allPosts.map(formatPostData).filter((p): p is FormattedPost => p !== null);
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
export const usePost = (postId: number | string) => {
    const { isAuthenticated, authLoading } = useAuth();
    
    const { data, loading, error, refetch } = useQuery<FormattedPost | null>(
        GRAPHQL_QUERIES.GET_POSTS,
        {},
        {
            skip: authLoading || !isAuthenticated || !postId,
            autoFetch: true,
            initialData: null,
            transform: (data: unknown): FormattedPost | null => {
                const typedData = data as { post?: { allposts?: RawPost[] } } | null;
                const allPosts = typedData?.post?.allposts || [];
                const foundPost = allPosts.find((p) => p.id === parseInt(String(postId)));
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
export const useProjectPosts = (projectId: number | string) => {
    const { isAuthenticated, authLoading } = useAuth();
    
    const { data, loading, error, refetch } = useQuery<FormattedPost[]>(
        GRAPHQL_QUERIES.GET_PROJECT_POSTS,
        { projectId: parseInt(String(projectId)) },
        {
            skip: authLoading || !isAuthenticated || !projectId,
            autoFetch: true,
            initialData: [],
            transform: (data: unknown): FormattedPost[] => {
                const typedData = data as { project?: { projectposts?: RawPost[] } } | null;
                const projectPosts = typedData?.project?.projectposts || [];
                return projectPosts.map(formatPostData).filter((p): p is FormattedPost => p !== null);
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
    
    const { data, loading, error, refetch, setData } = useQuery<FormattedPost[]>(
        GRAPHQL_QUERIES.GET_SAVED_POSTS,
        {},
        {
            skip: authLoading || !isAuthenticated,
            autoFetch: true,
            initialData: [],
            transform: (data: unknown): FormattedPost[] => {
                const typedData = data as { savedPost?: { savedposts?: RawPost[] } } | null;
                const savedPosts = typedData?.savedPost?.savedposts || [];
                return savedPosts.map((post): FormattedPost | null => {
                    const formatted = formatPostData(post);
                    if (!formatted) return null;
                    return {
                        ...formatted,
                        saved: true,
                        hidden: false
                    };
                }).filter((p): p is FormattedPost => p !== null);
            }
        }
    );

    return { posts: data, setPosts: setData, loading, error, refetch };
};
