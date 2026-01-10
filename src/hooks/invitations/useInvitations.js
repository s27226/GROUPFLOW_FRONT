import { useState, useEffect, useCallback, useRef } from "react";
import { useGraphQL, useQuery, useMutationQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES } from "../../queries/graphql";

/**
 * Custom hook for fetching all invitations (friend requests + project invitations)
 * Uses useMutationQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch invitations automatically on mount (default: true)
 * @returns {Object} { friendRequests, projectInvitations, loading, error, refetch, totalCount }
 */
export const useInvitations = (options = {}) => {
    const { autoFetch = true } = options;
    const [friendRequests, setFriendRequests] = useState([]);
    const [projectInvitations, setProjectInvitations] = useState([]);
    const { isAuthenticated, authLoading } = useAuth();
    const hasFetched = useRef(false);
    const { executeQuery } = useGraphQL();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInvitations = useCallback(async () => {
        if (!isAuthenticated) return { friendRequests: [], projectInvitations: [] };
        
        setLoading(true);
        setError(null);
        
        try {
            const [friendRequestsData, projectInvitationsData] = await Promise.all([
                executeQuery(GRAPHQL_QUERIES.GET_FRIEND_REQUESTS, { first: 50 }),
                executeQuery(GRAPHQL_QUERIES.GET_GROUP_INVITATIONS, { first: 50 })
            ]);

            const friendReqs =
                friendRequestsData?.friendRequest?.allfriendrequests?.nodes || [];
            const projectInvs =
                projectInvitationsData?.projectInvitation?.allprojectinvitations?.nodes || [];

            const formattedFriendRequests = friendReqs.map((req) => ({
                id: req.id,
                requester: req.requester,
                name: `${req.requester.name} ${req.requester.surname}`,
                nickname: req.requester.nickname,
                type: "friend",
                sent: req.sent
            }));

            const formattedProjectInvitations = projectInvs.map((inv) => ({
                id: inv.id,
                project: inv.project,
                inviting: inv.inviting,
                name: inv.project.name,
                description: inv.project.description,
                invitedBy: `${inv.inviting.name} ${inv.inviting.surname}`,
                type: "project"
            }));

            setFriendRequests(formattedFriendRequests);
            setProjectInvitations(formattedProjectInvitations);
            setLoading(false);
            
            return {
                friendRequests: formattedFriendRequests,
                projectInvitations: formattedProjectInvitations
            };
        } catch (err) {
            console.error("Failed to fetch invitations:", err);
            setError(err?.message || "Failed to fetch invitations");
            setFriendRequests([]);
            setProjectInvitations([]);
            setLoading(false);
            return {
                friendRequests: [],
                projectInvitations: []
            };
        }
    }, [executeQuery, isAuthenticated]);

    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated && !hasFetched.current) {
            hasFetched.current = true;
            fetchInvitations();
        }
    }, [autoFetch, authLoading, isAuthenticated, fetchInvitations]);

    const removeFromList = useCallback((id, type) => {
        if (type === "friend") {
            setFriendRequests((prev) => prev.filter((inv) => inv.id !== id));
        } else if (type === "project") {
            setProjectInvitations((prev) => prev.filter((inv) => inv.id !== id));
        }
    }, []);

    return {
        friendRequests,
        projectInvitations,
        loading,
        error,
        refetch: fetchInvitations,
        removeFromList,
        totalCount: friendRequests.length + projectInvitations.length
    };
};

/**
 * Custom hook for polling invitations count
 * Uses useGraphQL with automatic polling
 * @param {number} interval - Polling interval in milliseconds (default: 2 minutes)
 * @returns {Object} { count, loading }
 */
export const useInvitationsPolling = (interval = 2 * 60 * 1000) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { executeQuery } = useGraphQL();
    const executeQueryRef = useRef(executeQuery);
    
    // Update ref when executeQuery changes
    useEffect(() => {
        executeQueryRef.current = executeQuery;
    });

    const fetchInvitationsCount = useCallback(async () => {
        setLoading(true);
        try {
            const [friendRequestsData, groupInvitationsData] = await Promise.all([
                executeQueryRef.current(GRAPHQL_QUERIES.GET_FRIEND_REQUESTS, { first: 50 }),
                executeQueryRef.current(GRAPHQL_QUERIES.GET_GROUP_INVITATIONS, { first: 50 })
            ]);

            const friendRequestsCount =
                friendRequestsData?.friendRequest?.allfriendrequests?.nodes?.length || 0;
            const groupInvitationsCount =
                groupInvitationsData?.projectInvitation?.allprojectinvitations?.nodes?.length || 0;

            const totalCount = friendRequestsCount + groupInvitationsCount;
            setCount(totalCount);
            
            // Store in localStorage for persistence
            localStorage.setItem("InvitationsCount", totalCount.toString());
            
            return totalCount;
        } catch (error) {
            console.error("Failed to fetch invitations count:", error);
            return 0;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchInvitationsCount();

        // Set up polling
        const intervalId = setInterval(fetchInvitationsCount, interval);

        return () => clearInterval(intervalId);
    }, [fetchInvitationsCount, interval]);

    return { count, loading, refetch: fetchInvitationsCount };
};
