import { useState, useEffect, useCallback } from "react";
import { useGraphQL } from "./useGraphQL";
import { 
    GET_ALL_USERS, 
    GET_BANNED_USERS, 
    GET_SUSPENDED_USERS 
} from "../queries/moderationQueries";

/**
 * Custom hook for moderation user management
 * @param {string} userType - Type of users to fetch ('all', 'banned', 'suspended')
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch users automatically on mount (default: true)
 * @returns {Object} { users, loading, error, refetch }
 */
export const useModerationUsers = (userType = 'all', options = {}) => {
    const { autoFetch = true } = options;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let query;
            let dataPath;

            switch (userType) {
                case 'banned':
                    query = GET_BANNED_USERS;
                    dataPath = 'bannedUsers';
                    break;
                case 'suspended':
                    query = GET_SUSPENDED_USERS;
                    dataPath = 'suspendedUsers';
                    break;
                default:
                    query = GET_ALL_USERS;
                    dataPath = 'allUsers';
            }

            const response = await executeQuery(query);
            const userData = response?.moderation?.[dataPath] || [];
            
            setUsers(userData);
            return userData;
        } catch (err) {
            console.error(`Error fetching ${userType} users:`, err);
            setError(err);
            setUsers([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery, userType]);

    useEffect(() => {
        if (autoFetch) {
            fetchUsers();
        }
    }, [autoFetch, fetchUsers]);

    return {
        users,
        loading,
        error,
        refetch: fetchUsers
    };
};
