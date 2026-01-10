import { useState, useEffect, useCallback } from "react";
import { useGraphQL, useQuery, useMutationQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../queries/graphql";

/**
 * Custom hook for managing friends
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch friends automatically on mount (default: true)
 * @param {string} options.searchQuery - Optional search query to filter friends
 * @returns {Object} { friends, loading, error, refetch, removeFriend, addFriend, checkFriendship }
 */
export const useFriends = (options = {}) => {
    const { autoFetch = true, searchQuery = "" } = options;
    const [filteredFriends, setFilteredFriends] = useState([]);
    const { executeQuery, executeMutation } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();

    const { data: friends, loading, error, refetch, setData: setFriends } = useQuery(
        GRAPHQL_QUERIES.GET_MY_FRIENDS,
        {},
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data) => data?.friendship?.myfriends || []
        }
    );

    // Apply search filter
    useEffect(() => {
        if (searchQuery) {
            const filtered = friends.filter((friend) =>
                `${friend.name} ${friend.surname} ${friend.nickname}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredFriends(filtered);
        } else {
            setFilteredFriends(friends);
        }
    }, [friends, searchQuery]);

    const removeFriend = useCallback(
        async (friendId) => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.REMOVE_FRIEND, { friendId });
                // Update local state
                setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
                return true;
            } catch (err) {
                console.error("Failed to remove friend:", err);
                throw err;
            }
        },
        [executeMutation, setFriends]
    );

    const sendFriendRequest = useCallback(
        async (requesteeId) => {
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
        async (userId) => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_FRIENDSHIP_STATUS, {
                    friendId: userId
                });
                return data?.friendship?.friendshipstatus || false;
            } catch (err) {
                console.error("Failed to check friendship status:", err);
                return false;
            }
        },
        [executeQuery]
    );

    const isFriend = useCallback(
        (userId) => {
            return friends.some((friend) => friend.id === userId);
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
export const useFriendRequests = (options = {}) => {
    const { autoFetch = true } = options;
    const { executeMutation } = useGraphQL();

    const { data: friendRequests, loading, error, refetch, setData: setFriendRequests } = useQuery(
        GRAPHQL_QUERIES.GET_FRIEND_REQUESTS,
        { first: 50 },
        {
            skip: !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data) => {
                const requests = data?.friendRequest?.allfriendrequests?.nodes || [];
                return requests.map((req) => ({
                    id: req.id,
                    requester: req.requester,
                    name: `${req.requester.name} ${req.requester.surname}`,
                    nickname: req.requester.nickname,
                    sent: req.sent
                }));
            }
        }
    );

    const acceptRequest = useCallback(
        async (friendRequestId) => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.ACCEPT_FRIEND_REQUEST, {
                    friendRequestId
                });
                // Remove from local state
                setFriendRequests((prev) => prev.filter((req) => req.id !== friendRequestId));
                return true;
            } catch (err) {
                console.error("Failed to accept friend request:", err);
                throw err;
            }
        },
        [executeMutation, setFriendRequests]
    );

    const rejectRequest = useCallback(
        async (friendRequestId) => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.REJECT_FRIEND_REQUEST, {
                    friendRequestId
                });
                // Remove from local state
                setFriendRequests((prev) => prev.filter((req) => req.id !== friendRequestId));
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
        count: friendRequests.length
    };
};
