import { useState, useEffect, useCallback, useRef } from "react";
import { useGraphQL, useQuery, useMutationQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES } from "../../queries/graphql";
import { translateError } from "../../utils/errorTranslation";

interface InvitationUser {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface Project {
    id: number;
    name: string;
    description?: string;
}

interface FriendRequest {
    id: number;
    requester: InvitationUser;
    name: string;
    nickname?: string;
    type: "friend";
    sent: string;
}

interface ProjectInvitation {
    id: number;
    project: Project;
    inviting: InvitationUser;
    name: string;
    description?: string;
    invitedBy: string;
    type: "project";
}

interface UseInvitationsOptions {
    autoFetch?: boolean;
}

interface InvitationsResult {
    friendRequests: FriendRequest[];
    projectInvitations: ProjectInvitation[];
}

/**
 * Custom hook for fetching all invitations (friend requests + project invitations)
 * Uses useMutationQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch invitations automatically on mount (default: true)
 * @returns {Object} { friendRequests, projectInvitations, loading, error, refetch, totalCount }
 */
export const useInvitations = (options: UseInvitationsOptions = {}) => {
    const { autoFetch = true } = options;
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [projectInvitations, setProjectInvitations] = useState<ProjectInvitation[]>([]);
    const { isAuthenticated, authLoading } = useAuth();
    const hasFetched = useRef(false);
    const { executeQuery } = useGraphQL();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvitations = useCallback(async (): Promise<InvitationsResult> => {
        if (!isAuthenticated) return { friendRequests: [], projectInvitations: [] };
        
        setLoading(true);
        setError(null);
        
        try {
            interface RawFriendRequest {
                id: number;
                requester: InvitationUser;
                sent: string;
            }
            interface RawProjectInvitation {
                id: number;
                project: Project;
                inviting: InvitationUser;
            }
            
            const [friendRequestsData, projectInvitationsData] = await Promise.all([
                executeQuery(GRAPHQL_QUERIES.GET_FRIEND_REQUESTS, {}) as Promise<{ friendRequest?: { allfriendrequests?: RawFriendRequest[] } } | null>,
                executeQuery(GRAPHQL_QUERIES.GET_GROUP_INVITATIONS, {}) as Promise<{ projectInvitation?: { allprojectinvitations?: RawProjectInvitation[] } } | null>
            ]);

            const friendReqs =
                friendRequestsData?.friendRequest?.allfriendrequests || [];
            const projectInvs =
                projectInvitationsData?.projectInvitation?.allprojectinvitations || [];

            const formattedFriendRequests: FriendRequest[] = friendReqs.map((req): FriendRequest => ({
                id: req.id,
                requester: req.requester,
                name: `${req.requester.name || ''} ${req.requester.surname || ''}`.trim(),
                nickname: req.requester.nickname,
                type: "friend",
                sent: req.sent
            }));

            const formattedProjectInvitations: ProjectInvitation[] = projectInvs.map((inv): ProjectInvitation => ({
                id: inv.id,
                project: inv.project,
                inviting: inv.inviting,
                name: inv.project.name,
                description: inv.project.description,
                invitedBy: `${inv.inviting.name || ''} ${inv.inviting.surname || ''}`.trim(),
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
            const errorMessage = translateError(err instanceof Error ? err.message : '', 'invitations.fetchFailed');
            setError(errorMessage);
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

    const removeFromList = useCallback((id: number, type: "friend" | "project"): void => {
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
export const useInvitationsPolling = (interval: number = 2 * 60 * 1000) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { executeQuery } = useGraphQL();
    const executeQueryRef = useRef(executeQuery);
    
    // Update ref when executeQuery changes
    useEffect(() => {
        executeQueryRef.current = executeQuery;
    });

    const fetchInvitationsCount = useCallback(async (): Promise<number> => {
        setLoading(true);
        try {
            interface FriendRequestsResponse {
                friendRequest?: { allfriendrequests?: unknown[] };
            }
            interface ProjectInvitationsResponse {
                projectInvitation?: { allprojectinvitations?: unknown[] };
            }
            
            // Use lighter count-only queries for polling
            const [friendRequestsData, groupInvitationsData] = await Promise.all([
                executeQueryRef.current(GRAPHQL_QUERIES.GET_FRIEND_REQUESTS_COUNT, {}) as Promise<FriendRequestsResponse | null>,
                executeQueryRef.current(GRAPHQL_QUERIES.GET_GROUP_INVITATIONS_COUNT, {}) as Promise<ProjectInvitationsResponse | null>
            ]);

            const friendRequestsCount =
                friendRequestsData?.friendRequest?.allfriendrequests?.length || 0;
            const groupInvitationsCount =
                groupInvitationsData?.projectInvitation?.allprojectinvitations?.length || 0;

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
