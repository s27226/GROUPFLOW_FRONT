import { useState, useEffect, useCallback } from "react";
import { useGraphQL, useQuery, useMutationQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../queries/graphql";

interface Friend {
    id: string;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface FriendRequest {
    id: string;
    requester: Friend;
    name: string;
    nickname?: string;
    sent: string;
}

interface UseFriendsOptions {
    autoFetch?: boolean;
    searchQuery?: string;
}

interface UseFriendRequestsOptions {
    autoFetch?: boolean;
}

/**
 * Custom hook for managing friends
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch friends automatically on mount (default: true)
 * @param {string} options.searchQuery - Optional search query to filter friends
 * @returns {Object} { friends, loading, error, refetch, removeFriend, addFriend, checkFriendship }
 */
export const useFriends = (options: UseFriendsOptions = {}) => {
    const { autoFetch = true, searchQuery = "" } = options;
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const { executeQuery, executeMutation } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();

    const { data: friends, loading, error, refetch, setData: setFriends } = useQuery<Friend[]>(
        GRAPHQL_QUERIES.GET_MY_FRIENDS,
        {},
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data: unknown): Friend[] => {
                const typedData = data as { friendship?: { myfriends?: Friend[] } } | null;
                return typedData?.friendship?.myfriends || [];
            }
        }
    );

    // Apply search filter
    useEffect(() => {
        if (searchQuery && friends) {
            const filtered = friends.filter((friend: Friend) =>
                `${friend.name || ''} ${friend.surname || ''} ${friend.nickname || ''}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredFriends(filtered);
        } else {
            setFilteredFriends(friends || []);
        }
    }, [friends, searchQuery]);

    const removeFriend = useCallback(
        async (friendId: string): Promise<boolean> => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.REMOVE_FRIEND, { friendId });
                // Update local state
                setFriends((prev) => (prev || []).filter((friend: Friend) => friend.id !== friendId));
                return true;
            } catch (err) {
                console.error("Failed to remove friend:", err);
                throw err;
            }
        },
        [executeMutation, setFriends]
    );

    const sendFriendRequest = useCallback(
        async (requesteeId: string): Promise<boolean> => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST, { requesteeId });
                return true;
            } catch (err) {
                console.error("Failed to send friend request:", err);
                throw err;
            }
        },
        [executeMutation]
    );

    const checkFriendship = useCallback(
        async (userId: string): Promise<boolean> => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_FRIENDSHIP_STATUS, {
                    friendId: userId
                }) as { friendship?: { friendshipstatus?: boolean } } | null;
                return data?.friendship?.friendshipstatus || false;
            } catch (err) {
                console.error("Failed to check friendship status:", err);
                return false;
            }
        },
        [executeQuery]
    );

    const isFriend = useCallback(
        (userId: string): boolean => {
            return (friends || []).some((friend: Friend) => friend.id === userId);
        },
        [friends]
    );

    return {
        friends: searchQuery ? filteredFriends : friends,
        allFriends: friends,
        loading,
        error,
        refetch,
        removeFriend,
        sendFriendRequest,
        checkFriendship,
        isFriend
    };
};

/**
 * Custom hook for managing friend requests
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch friend requests automatically on mount (default: true)
 * @returns {Object} { friendRequests, loading, error, refetch, acceptRequest, rejectRequest }
 */
export const useFriendRequests = (options: UseFriendRequestsOptions = {}) => {
    const { autoFetch = true } = options;
    const { executeMutation } = useGraphQL();

    const { data: friendRequests, loading, error, refetch, setData: setFriendRequests } = useQuery<FriendRequest[]>(
        GRAPHQL_QUERIES.GET_FRIEND_REQUESTS,
        { first: 50 },
        {
            skip: !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data: unknown): FriendRequest[] => {
                const typedData = data as { friendRequest?: { allfriendrequests?: { nodes?: Array<{ id: string; requester: Friend; sent: string }> } } } | null;
                const requests = typedData?.friendRequest?.allfriendrequests?.nodes || [];
                return requests.map((req): FriendRequest => ({
                    id: req.id,
                    requester: req.requester,
                    name: `${req.requester.name || ''} ${req.requester.surname || ''}`.trim(),
                    nickname: req.requester.nickname,
                    sent: req.sent
                }));
            }
        }
    );

    const acceptRequest = useCallback(
        async (friendRequestId: string): Promise<boolean> => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.ACCEPT_FRIEND_REQUEST, {
                    friendRequestId
                });
                // Remove from local state
                setFriendRequests((prev) => (prev || []).filter((req: FriendRequest) => req.id !== friendRequestId));
                return true;
            } catch (err) {
                console.error("Failed to accept friend request:", err);
                throw err;
            }
        },
        [executeMutation, setFriendRequests]
    );

    const rejectRequest = useCallback(
        async (friendRequestId: string): Promise<boolean> => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.REJECT_FRIEND_REQUEST, {
                    friendRequestId
                });
                // Remove from local state
                setFriendRequests((prev) => (prev || []).filter((req: FriendRequest) => req.id !== friendRequestId));
                return true;
            } catch (err) {
                console.error("Failed to reject friend request:", err);
                throw err;
            }
        },
        [executeMutation, setFriendRequests]
    );

    return {
        friendRequests,
        loading,
        error,
        refetch,
        acceptRequest,
        rejectRequest,
        count: friendRequests?.length ?? 0
    };
};
