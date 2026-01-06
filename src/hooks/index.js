/**
 * Custom Hooks Index
 * 
 * This file exports all custom hooks for easy importing throughout the application.
 * All hooks follow consistent patterns for options and return values.
 */

// Authentication & Requests
export { useAuth } from '../context/AuthContext';
export { useAuthenticatedRequest } from './useAuthenticatedRequest';
export { useGraphQL } from './useGraphQL';

// Friends Management
export { useFriends, useFriendRequests } from './useFriends';

// Projects Management
export { 
    useMyProjects, 
    useUserProjects, 
    useProject,
    useProjectInvitations 
} from './useProjects';

// Users & Search
export { 
    useUserSearch, 
    useAllUsers, 
    useUser 
} from './useUsers';

// Invitations
export { 
    useInvitations, 
    useInvitationsPolling 
} from './useInvitations';

// Posts
export { 
    usePosts, 
    usePost, 
    useProjectPosts, 
    useSavedPosts 
} from './usePosts';

// Post Interactions
export { usePostInteractions } from './usePostInteractions';

// Chat
export { useChat } from './useChat';
export { useChats, useChatMessages } from './useChats';

// Moderation
export { useModerationUsers } from './useModeration';

// Trending
export { useTrendingProjects } from './useTrendingProjects';

// UI Utilities
export { useClickOutside } from './useClickOutside';
export { useImageLoaded } from './useImageLoaded';
export { useSearchQuery } from './useSearchQuery';

// File Upload
export { useBlobUpload } from './useBlobUpload';

// Polling
export { useInvitationPolling } from './useInvitationPolling';

/**
 * Hook Options Pattern
 * 
 * All data-fetching hooks follow this pattern:
 * 
 * @typedef {Object} HookOptions
 * @property {boolean} [autoFetch=true] - Whether to fetch data automatically on mount
 * @property {any} [additionalOptions] - Hook-specific options
 * 
 * @returns {Object} HookReturn
 * @property {any} data - The fetched data
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error state if any
 * @property {Function} refetch - Function to manually refetch data
 * @property {Function} [additionalMethods] - Hook-specific methods
 */

/**
 * Usage Examples:
 * 
 * // Friends
 * const { friends, loading, removeFriend } = useFriends({ autoFetch: true });
 * 
 * // Projects
 * const { projects, loading } = useMyProjects({ autoFetch: true });
 * 
 * // User Search
 * const { results, search } = useUserSearch({ autoFetch: false });
 * await search("query", ["skill"], ["interest"]);
 * 
 * // Invitations
 * const { friendRequests, projectInvitations, totalCount } = useInvitations();
 */
