import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useGraphQL } from "./useGraphQL";
import { GRAPHQL_QUERIES } from "../queries/graphql";

export function useInvitationPolling(setInvitationsCount) {
    const { token } = useAuth();
    const { executeQuery } = useGraphQL();

    useEffect(() => {
        if (!token) {
            // Clear count when logged out
            setInvitationsCount(0);
            localStorage.setItem("InvitationsCount", "0");
            return;
        }

        const fetchInvitationsCount = async () => {
            try {
                const [friendRequestsData, groupInvitationsData] = await Promise.all([
                    executeQuery(GRAPHQL_QUERIES.GET_FRIEND_REQUESTS, { first: 50 }),
                    executeQuery(GRAPHQL_QUERIES.GET_GROUP_INVITATIONS, { first: 50 })
                ]);

                const friendRequestsCount = friendRequestsData?.friendRequest?.allfriendrequests?.nodes?.length || 0;
                const groupInvitationsCount = groupInvitationsData?.projectInvitation?.allprojectinvitations?.nodes?.length || 0;
                const totalCount = friendRequestsCount + groupInvitationsCount;

                setInvitationsCount(totalCount);
                localStorage.setItem("InvitationsCount", totalCount.toString());
            } catch (err) {
                console.error("Failed to fetch invitations count:", err);
            }
        };

        // Fetch immediately on mount/login
        fetchInvitationsCount();

        // Set up polling every 2 minutes
        const intervalId = setInterval(fetchInvitationsCount, 2 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [token, executeQuery, setInvitationsCount]);
}
