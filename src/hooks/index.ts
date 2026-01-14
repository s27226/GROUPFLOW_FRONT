/**
 * Custom Hooks Index
 * 
 * This file exports all custom hooks for easy importing throughout the application.
 * All hooks follow consistent patterns for options and return values.
 * 
 * UNIFIED API COMMUNICATION PATTERN:
 * - useQuery: For data fetching with automatic loading/error state
 * - useMutationQuery: For mutations with loading/error state
 * - useAsyncOperation: Low-level async operation handling
 */

// Core API Hooks - Unified Interface
export { useGraphQL, useQuery, useMutationQuery, useAsyncOperation, useFetch, useMutation, useAuthenticatedRequest } from './core';

// Authentication
export { useAuth } from '../context/AuthContext';

// Chat
export { useChat, useChats, useChatMessages } from './chat';

// Friends
export { useFriends, useFriendRequests } from './friends';

// Invitations
export { useInvitations, useInvitationsPolling, useInvitationPolling } from './invitations';

// Moderation
export { useModerationUsers } from './moderation';

// Posts
export { usePosts, usePost, useProjectPosts, useSavedPosts, usePostInteractions } from './posts';

// Projects
export { useMyProjects, useUserProjects, useProject, useProjectInvitations, useTrendingProjects } from './projects';

// UI Utilities
export { useClickOutside, useImageLoaded, useSearchQuery } from './ui';

// Upload
export { useBlobUpload } from './upload';

// Users
export { useUserSearch, useAllUsers, useUser, useUserProfile, useUserProfileByNickname, type UserProfileData } from './users';

/**
 * Hook Options Pattern
 * 
 * All data-fetching hooks follow this unified pattern:
 * 
 * @typedef {Object} HookOptions
 * @property {boolean} [autoFetch=true] - Whether to fetch data automatically on mount
 * @property {boolean} [skip=false] - Whether to skip the fetch (useful for conditional fetching)
 * @property {any} [initialData=null] - Initial data value
 * @property {Function} [transform] - Function to transform fetched data
 * @property {Function} [onSuccess] - Callback on successful fetch
 * @property {Function} [onError] - Callback on fetch error
 * 
 * @returns {Object} HookReturn
 * @property {any} data - The fetched data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Function} refetch - Function to manually refetch data
 * @property {Function} setData - Function to manually update data
 */

/**
 * Usage Examples:
 * 
 * // Using useQuery directly for custom queries
 * const { data, loading, error, refetch } = useQuery(
 *   GET_USERS,
 *   { limit: 10 },           // variables as second parameter
 *   { transform: (data) => data.users.list }  // options as third parameter
 * );
 * 
 * // Using useMutationQuery for mutations (with predefined mutation)
 * const { mutate, loading } = useMutationQuery(CREATE_POST, {
 *   onSuccess: () => showToast('Post created!')
 * });
 * await mutate({ input: { title, content } });
 * 
 * // Using useMutationQuery with dynamic mutations
 * const { execute, loading } = useMutationQuery({
 *   onSuccess: () => showToast('Success!')
 * });
 * await execute(SOME_MUTATION, { input: { ... } });
 * 
 * // Using domain hooks (built on useQuery)
 * const { friends, loading, removeFriend } = useFriends({ autoFetch: true });
 * const { projects, loading } = useMyProjects();
 * const { results, search } = useUserSearch({ autoFetch: false });
 */
