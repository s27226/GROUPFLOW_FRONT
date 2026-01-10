import { useState, useEffect, useCallback, useRef } from "react";
import { useGraphQL, useQuery, useMutationQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES } from "../../queries/graphql";

/**
 * Custom hook for user search
 * Uses useMutationQuery-like pattern for on-demand search operations
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch initially (default: false)
 * @returns {Object} { results, loading, error, search, loadSuggested }
 */
export const useUserSearch = (options = {}) => {
    const { autoFetch = false } = options;
    const [results, setResults] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const { isAuthenticated, authLoading } = useAuth();
    const hasFetched = useRef(false);

    const { execute, loading, error } = useMutationQuery({
        onError: (err) => console.error("User search failed:", err)
    });

    const search = useCallback(
        async (searchTerm = "", skills = [], interests = []) => {
            if (!isAuthenticated) return [];
            
            const input = {
                searchTerm: searchTerm || null,
                skills: skills.length > 0 ? skills : null,
                interests: interests.length > 0 ? interests : null
            };

            const data = await execute(GRAPHQL_QUERIES.SEARCH_USERS, { input });
            const searchResults = data?.users?.searchusers || [];
            setResults(searchResults);
            return searchResults;
        },
        [execute, isAuthenticated]
    );

    const loadSuggested = useCallback(
        async (limit = 20) => {
            if (!isAuthenticated) return [];
            
            const data = await execute(GRAPHQL_QUERIES.GET_SUGGESTED_USERS, { limit });
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
export const useAllUsers = (options = {}) => {
    const { autoFetch = true, filter = {} } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery(
        GRAPHQL_QUERIES.GET_ALL_USERS,
        { where: filter },
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data) => data?.users?.allusers || []
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
export const useUser = (identifier, options = {}) => {
    const { autoFetch = true, byNickname = false } = options;
    const { isAuthenticated, authLoading } = useAuth();
    
    const query = byNickname 
        ? GRAPHQL_QUERIES.GET_USER_BY_NICKNAME 
        : GRAPHQL_QUERIES.GET_USER_BY_ID;
    
    const variables = byNickname 
        ? { nickname: identifier }
        : { userId: parseInt(identifier) };

    const { data, loading, error, refetch } = useQuery(
        query,
        variables,
        {
            skip: authLoading || !isAuthenticated || !identifier || !autoFetch,
            autoFetch: autoFetch,
            initialData: null,
            transform: (data) => byNickname 
                ? data?.users?.userbynickname || null
                : data?.users?.userbyid || null
        }
    );

    return {
        user: data,
        loading,
        error,
        refetch
    };
};
