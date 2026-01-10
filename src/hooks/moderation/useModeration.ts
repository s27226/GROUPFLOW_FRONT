import { useQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { 
    GET_ALL_USERS, 
    GET_BANNED_USERS, 
    GET_SUSPENDED_USERS 
} from "../../queries/moderationQueries";

export interface ModerationUser {
    id: string;
    name?: string;
    surname?: string;
    nickname: string;
    email?: string;
    isBanned?: boolean;
    isSuspended?: boolean;
    suspendedUntil?: string;
    bannedAt?: string;
    profilePic?: string;
    isModerator?: boolean;
    banReason?: string;
    banExpiresAt?: string;
    bannedBy?: { nickname: string };
    joined?: string;
}

interface UseModerationUsersOptions {
    autoFetch?: boolean;
}

type UserType = 'all' | 'banned' | 'suspended';

interface QueryConfig {
    query: string;
    dataPath: string;
}

/**
 * Custom hook for moderation user management
 * Uses useQuery for unified loading/error state management
 * @param {string} userType - Type of users to fetch ('all', 'banned', 'suspended')
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch users automatically on mount (default: true)
 * @returns {Object} { users, loading, error, refetch }
 */
export const useModerationUsers = (userType: UserType = 'all', options: UseModerationUsersOptions = {}) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();

    // Select query and data path based on user type
    const getQueryConfig = (): QueryConfig => {
        switch (userType) {
            case 'banned':
                return { query: GET_BANNED_USERS, dataPath: 'bannedUsers' };
            case 'suspended':
                return { query: GET_SUSPENDED_USERS, dataPath: 'suspendedUsers' };
            default:
                return { query: GET_ALL_USERS, dataPath: 'allUsers' };
        }
    };

    const { query, dataPath } = getQueryConfig();

    const { data, loading, error, refetch } = useQuery<ModerationUser[]>(
        query,
        {},
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (response: unknown): ModerationUser[] => {
                const typedResponse = response as { moderation?: Record<string, ModerationUser[]> } | null;
                return typedResponse?.moderation?.[dataPath] || [];
            }
        }
    );

    return {
        users: data,
        loading,
        error,
        refetch
    };
};
