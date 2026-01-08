import { useState, useEffect, useCallback } from "react";
import { useGraphQL } from "./useGraphQL";
import { useAuth } from "../context/AuthContext";
import { GRAPHQL_QUERIES } from "../queries/graphql";

/**
 * Custom hook for user search
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch initially (default: false)
 * @returns {Object} { results, loading, error, search, loadSuggested }
 */
export const useUserSearch = (options = {}) => {
    const { autoFetch = false } = options;
    const [results, setResults] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();

    const search = useCallback(
        async (searchTerm = "", skills = [], interests = []) => {
            if (!isAuthenticated) return [];
            
            setLoading(true);
            setError(null);
            try {
                const input = {
                    searchTerm: searchTerm || null,
                    skills: skills.length > 0 ? skills : null,
                    interests: interests.length > 0 ? interests : null
                };

                const data = await executeQuery(GRAPHQL_QUERIES.SEARCH_USERS, { input });
                const searchResults = data?.users?.searchusers || [];
                setResults(searchResults);
                return searchResults;
            } catch (err) {
                console.error("User search failed:", err);
                setError(err);
                setResults([]);
                return [];
            } finally {
                setLoading(false);
            }
        },
        [executeQuery, isAuthenticated]
    );

    const loadSuggested = useCallback(
        async (limit = 20) => {
            if (!isAuthenticated) return [];
            
            setLoading(true);
            setError(null);
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_SUGGESTED_USERS, { limit });
                const suggested = data?.users?.suggestedusers || [];
                setSuggestedUsers(suggested);
                setResults(suggested);
                return suggested;
            } catch (err) {
                console.error("Failed to load suggested users:", err);
                setError(err);
                setSuggestedUsers([]);
                return [];
            } finally {
                setLoading(false);
            }
        },
        [executeQuery, isAuthenticated]
    );

    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated) {
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
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch users automatically on mount (default: true)
 * @param {Object} options.filter - Filter criteria for users
 * @returns {Object} { users, loading, error, refetch }
 */
export const useAllUsers = (options = {}) => {
    const { autoFetch = true, filter = {} } = options;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();

    const fetchUsers = useCallback(async () => {
        if (!isAuthenticated) return [];
        
        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_ALL_USERS, { where: filter });
            const usersData = data?.users?.allusers || [];
            setUsers(usersData);
            return usersData;
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError(err);
            setUsers([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery, filter, isAuthenticated]);

    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated) {
            fetchUsers();
        }
    }, [autoFetch, authLoading, isAuthenticated, fetchUsers]);

    return {
        users,
        loading,
        error,
        refetch: fetchUsers
    };
};

/**
 * Custom hook for fetching a single user by ID or nickname
 * @param {number|string} identifier - User ID or nickname
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch user automatically on mount (default: true)
 * @param {boolean} options.byNickname - Whether identifier is a nickname (default: false)
 * @returns {Object} { user, loading, error, refetch }
 */
export const useUser = (identifier, options = {}) => {
    const { autoFetch = true, byNickname = false } = options;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();

    const fetchUser = useCallback(async () => {
        if (!identifier || !isAuthenticated) return null;
        
        setLoading(true);
        setError(null);
        try {
            let data;
            if (byNickname) {
                data = await executeQuery(GRAPHQL_QUERIES.GET_USER_BY_NICKNAME, { 
                    nickname: identifier 
                });
                const userData = data?.users?.userbynickname || null;
                setUser(userData);
                return userData;
            } else {
                data = await executeQuery(GRAPHQL_QUERIES.GET_USER_BY_ID, { 
                    userId: parseInt(identifier) 
                });
                const userData = data?.users?.userbyid || null;
                setUser(userData);
                return userData;
            }
        } catch (err) {
            console.error("Failed to fetch user:", err);
            setError(err);
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [executeQuery, identifier, byNickname, isAuthenticated]);

    useEffect(() => {
        if (autoFetch && identifier && !authLoading && isAuthenticated) {
            fetchUser();
        }
    }, [autoFetch, identifier, authLoading, isAuthenticated, fetchUser]);

    return {
        user,
        loading,
        error,
        refetch: fetchUser
    };
};
