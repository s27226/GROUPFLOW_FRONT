import { useState, useEffect, useCallback } from "react";
import { useGraphQL } from "./useGraphQL";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";

/**
 * Custom hook for managing friends
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch friends automatically on mount (default: true)
 * @param {string} options.searchQuery - Optional search query to filter friends
 * @returns {Object} { friends, loading, error, refetch, removeFriend, addFriend, checkFriendship }
 */
export const useFriends = (options = {}) => {
    const { autoFetch = true, searchQuery = "" } = options;
    const [friends, setFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery, executeMutation } = useGraphQL();

    const fetchFriends = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_FRIENDS, {});
            const friendsData = data?.friendship?.myfriends || [];
            setFriends(friendsData);
            return friendsData;
        } catch (err) {
            console.error("Failed to fetch friends:", err);
            setError(err);
            setFriends([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery]);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchFriends();
        }
    }, [autoFetch, fetchFriends]);

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
        [executeMutation]
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
        refetch: fetchFriends,
        removeFriend,
        sendFriendRequest,
        checkFriendship,
        isFriend
    };
};

/**
 * Custom hook for managing friend requests
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch friend requests automatically on mount (default: true)
 * @returns {Object} { friendRequests, loading, error, refetch, acceptRequest, rejectRequest }
 */
export const useFriendRequests = (options = {}) => {
    const { autoFetch = true } = options;
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery, executeMutation } = useGraphQL();

    const fetchFriendRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_FRIEND_REQUESTS, { first: 50 });
            const requests = data?.friendRequest?.allfriendrequests?.nodes || [];
            
            const formattedRequests = requests.map((req) => ({
                id: req.id,
                requester: req.requester,
                name: `${req.requester.name} ${req.requester.surname}`,
                nickname: req.requester.nickname,
                sent: req.sent
            }));
            
            setFriendRequests(formattedRequests);
            return formattedRequests;
        } catch (err) {
            console.error("Failed to fetch friend requests:", err);
            setError(err);
            setFriendRequests([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery]);

    useEffect(() => {
        if (autoFetch) {
            fetchFriendRequests();
        }
    }, [autoFetch, fetchFriendRequests]);

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
        [executeMutation]
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
        [executeMutation]
    );

    return {
        friendRequests,
        loading,
        error,
        refetch: fetchFriendRequests,
        acceptRequest,
        rejectRequest,
        count: friendRequests.length
    };
};
