import {useContext, useEffect, useState} from "react";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import "../styles/Invitation.css";
import Invitation from "./Invitation";
import {InvitationContext} from "../context/InvitationContext";
import { useGraphQL } from "../hooks/useGraphQL";
import LoadingSpinner from "./ui/LoadingSpinner";


export default function Invitations() {
    const [friendRequests, setFriendRequests] = useState([]);
    const [groupInvitations, setGroupInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("friends");
    const { executeQuery } = useGraphQL();

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const [friendRequestsData, groupInvitationsData] = await Promise.all([
                    executeQuery(GRAPHQL_QUERIES.GET_FRIEND_REQUESTS, { first: 50 }),
                    executeQuery(GRAPHQL_QUERIES.GET_GROUP_INVITATIONS, { first: 50 })
                ]);

                const friendReqs = friendRequestsData?.friendRequest?.allfriendrequests?.nodes || [];
                const groupInvs = groupInvitationsData?.projectInvitation?.allprojectinvitations?.nodes || [];

                const formattedFriendRequests = friendReqs.map(req => ({
                    id: req.id,
                    name: `${req.requester.name} ${req.requester.surname}`,
                    nickname: req.requester.nickname,
                    type: "friend",
                    sent: req.sent
                }));

                const formattedGroupInvitations = groupInvs.map(inv => ({
                    id: inv.id,
                    name: inv.project.name,
                    description: inv.project.description,
                    type: "group"
                }));

                setFriendRequests(formattedFriendRequests);
                setGroupInvitations(formattedGroupInvitations);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch invitations:", err);
                setFriendRequests([]);
                setGroupInvitations([]);
                setLoading(false);
            }
        };

        fetchInvitations();
    }, [executeQuery]);

    const handleRemove = (id) => {
        // Remove invitation from the appropriate list
        setFriendRequests(prev => prev.filter(inv => inv.id !== id));
        setGroupInvitations(prev => prev.filter(inv => inv.id !== id));
    };

    const {setInvitationsCount} = useContext(InvitationContext);

    useEffect(() => {
        const totalCount = friendRequests.length + groupInvitations.length;
        setInvitationsCount(totalCount);
        localStorage.setItem("InvitationsCount", totalCount);
    }, [friendRequests, groupInvitations, setInvitationsCount]);

    if (loading) {
        return (
            <div className="invitations-container">
                <LoadingSpinner />
            </div>
        );
    }

    const currentInvitations = activeTab === "friends" ? friendRequests : groupInvitations;

    return (
        <div className="invitations-container">
            <h1>Invitations</h1>
            
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === "friends" ? "active" : ""}`}
                    onClick={() => setActiveTab("friends")}
                >
                    Friend Requests ({friendRequests.length})
                </button>
                <button 
                    className={`tab ${activeTab === "groups" ? "active" : ""}`}
                    onClick={() => setActiveTab("groups")}
                >
                    Group Invitations ({groupInvitations.length})
                </button>
            </div>

            <div className="invitations-list">
                {currentInvitations.length === 0 ? (
                    <p className="empty">
                        {activeTab === "friends" 
                            ? "No friend requests" 
                            : "No group invitations"}
                    </p>
                ) : (
                    currentInvitations.map(inv => (
                        <Invitation
                            key={inv.id}
                            data={inv}
                            onRemove={handleRemove}
                        />
                    ))
                )}
            </div>
        </div>
    );
}