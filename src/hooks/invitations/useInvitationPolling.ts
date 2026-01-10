import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useInvitationsPolling } from "./useInvitations";

export function useInvitationPolling(setInvitationsCount: (count: number) => void): void {
    const { isAuthenticated } = useAuth();
    const { count } = useInvitationsPolling(2 * 60 * 1000); // Poll every 2 minutes

    useEffect(() => {
        if (!isAuthenticated) {
            // Clear count when logged out
            setInvitationsCount(0);
            localStorage.setItem("InvitationsCount", "0");
            return;
        }

        setInvitationsCount(count);
    }, [isAuthenticated, count, setInvitationsCount]);
}
