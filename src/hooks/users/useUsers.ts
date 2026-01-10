import { useState, useEffect, useCallback, useRef } from "react";
import { useGraphQL, useQuery, useMutationQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES } from "../../queries/graphql";

interface Skill {
    id: string;
    skillName: string;
}

interface Interest {
    id: string;
    interestName: string;
}

export interface SearchUserData {
    id: string;
    name?: string;
    surname?: string;
    nickname: string;
    profilePic?: string;
    bio?: string;
    skills?: Skill[];
    interests?: Interest[];
}

export interface SearchUser {
    user: SearchUserData;
    hasPendingRequest: boolean;
    isFriend: boolean;
    matchScore?: number;
    commonSkills?: number;
    commonInterests?: number;
    commonProjects?: number;
    recentInteractions?: number;
}

interface UseUserSearchOptions {
    autoFetch?: boolean;
}

interface UseAllUsersOptions {
    autoFetch?: boolean;
    filter?: Record<string, unknown>;
}

interface UseUserOptions {
    autoFetch?: boolean;
    byNickname?: boolean;
}

/**
 * Custom hook for user search
 * Uses useMutationQuery-like pattern for on-demand search operations
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch initially (default: false)
 * @returns {Object} { results, loading, error, search, loadSuggested }
 */
export const useUserSearch = (options: UseUserSearchOptions = {}) => {
    const { autoFetch = false } = options;
    const [results, setResults] = useState<SearchUser[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<SearchUser[]>([]);
    const { isAuthenticated, authLoading } = useAuth();
    const hasFetched = useRef(false);

    const { execute, loading, error } = useMutationQuery({
        onError: (err) => console.error("User search failed:", err)
    });

    const search = useCallback(
        async (searchTerm: string = "", skills: string[] = [], interests: string[] = []): Promise<SearchUser[]> => {
            if (!isAuthenticated) return [];
            
            const input = {
                searchTerm: searchTerm || null,
                skills: skills.length > 0 ? skills : null,
                interests: interests.length > 0 ? interests : null
            };

            const data = await execute(GRAPHQL_QUERIES.SEARCH_USERS, { input }) as { users?: { searchusers?: SearchUser[] } } | null;
            const searchResults = data?.users?.searchusers || [];
            setResults(searchResults);
            return searchResults;
        },
        [execute, isAuthenticated]
    );

    const loadSuggested = useCallback(
        async (limit: number = 20): Promise<SearchUser[]> => {
            if (!isAuthenticated) return [];
            
            const data = await execute(GRAPHQL_QUERIES.GET_SUGGESTED_USERS, { limit }) as { users?: { suggestedusers?: SearchUser[] } } | null;
            const suggested = data?.users?.suggestedusers || [];
            setSuggestedUsers(suggested);
            setResults(suggested);
            return suggested;
        },
        [execute, isAuthenticated]
    );

    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated && !hasFetched.current) {
            hasFetched.current = true;
            loadSuggested();
        }
    }, [autoFetch, authLoading, isAuthenticated, loadSuggested]);

    return {
        results,
        suggestedUsers,
        loading,
        error,
        search,
        loadSuggested
    };
};

/**
 * Custom hook for fetching all users (admin/moderation)
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch users automatically on mount (default: true)
 * @param {Object} options.filter - Filter criteria for users
 * @returns {Object} { users, loading, error, refetch }
 */
export const useAllUsers = (options: UseAllUsersOptions = {}) => {
    const { autoFetch = true, filter = {} } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery<SearchUser[]>(
        GRAPHQL_QUERIES.GET_ALL_USERS,
        { where: filter },
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data: unknown): SearchUser[] => {
                const typedData = data as { users?: { allusers?: SearchUser[] } } | null;
                return typedData?.users?.allusers || [];
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

/**
 * Custom hook for fetching a single user by ID or nickname
 * Uses useQuery for unified loading/error state management
 * @param {number|string} identifier - User ID or nickname
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch user automatically on mount (default: true)
 * @param {boolean} options.byNickname - Whether identifier is a nickname (default: false)
 * @returns {Object} { user, loading, error, refetch }
 */
export const useUser = (identifier: number | string, options: UseUserOptions = {}) => {
    const { autoFetch = true, byNickname = false } = options;
    const { isAuthenticated, authLoading } = useAuth();
    
    const query = byNickname 
        ? GRAPHQL_QUERIES.GET_USER_BY_NICKNAME 
        : GRAPHQL_QUERIES.GET_USER_BY_ID;
    
    const variables = byNickname 
        ? { nickname: identifier }
        : { userId: parseInt(String(identifier)) };

    const { data, loading, error, refetch } = useQuery<SearchUser | null>(
        query,
        variables,
        {
            skip: authLoading || !isAuthenticated || !identifier || !autoFetch,
            autoFetch: autoFetch,
            initialData: null,
            transform: (data: unknown): SearchUser | null => {
                const typedData = data as { users?: { userbynickname?: SearchUser; userbyid?: SearchUser } } | null;
                return byNickname 
                    ? typedData?.users?.userbynickname || null
                    : typedData?.users?.userbyid || null;
            }
        }
    );

    return {
        user: data,
        loading,
        error,
        refetch
    };
};
