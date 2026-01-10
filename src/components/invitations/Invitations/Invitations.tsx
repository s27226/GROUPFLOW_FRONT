import { useContext, useEffect, useState } from "react";
import styles from "./Invitations.module.css";
import Invitation from "../Invitation";
import { InvitationContext } from "../../../context/InvitationContext";
import { useInvitations } from "../../../hooks";
import LoadingSpinner from "../../ui/LoadingSpinner";

export default function Invitations() {
    const [activeTab, setActiveTab] = useState("friends");
    const { setInvitationsCount } = useContext(InvitationContext);
    
    // Use unified invitations hook
    const { 
        friendRequests, 
        projectInvitations, 
        loading, 
        removeFromList,
        totalCount 
    } = useInvitations({ autoFetch: true });

    // Update invitations count in context
    useEffect(() => {
        setInvitationsCount(totalCount);
        localStorage.setItem("InvitationsCount", totalCount.toString());
    }, [totalCount, setInvitationsCount]);

    const handleRemove = (id: number, type?: string): void => {
        removeFromList(id, type as 'friend' | 'project');
    };

    if (loading) {
        return (
            <div className={styles.invitationsContainer}>
                <LoadingSpinner />
            </div>
        );
    }

    const currentInvitations = activeTab === "friends" ? friendRequests : projectInvitations;

    return (
        <div className={styles.invitationsContainer}>
            <h1>Invitations</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "friends" ? styles.active : ""}`}
                    onClick={() => setActiveTab("friends")}
                >
                    Friend Requests ({friendRequests.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "groups" ? styles.active : ""}`}
                    onClick={() => setActiveTab("groups")}
                >
                    Group Invitations ({projectInvitations.length})
                </button>
            </div>

            <div className={styles.invitationsList}>
                {currentInvitations.length === 0 ? (
                    <p className={styles.empty}>
                        {activeTab === "friends" ? "No friend requests" : "No group invitations"}
                    </p>
                ) : (
                    currentInvitations.map((inv) => (
                        <Invitation key={inv.id} data={inv} onRemove={handleRemove} />
                    ))
                )}
            </div>
        </div>
    );
}
