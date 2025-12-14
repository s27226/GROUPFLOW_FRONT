import { useState } from "react";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import "../styles/Invitation.css";

export default function Invitation({ data, onRemove }) {
    const [loading, setLoading] = useState(false);
    const { executeMutation } = useGraphQL();

    const handleAccept = async () => {
        setLoading(true);
        try {
            if (data.type === "friend") {
                await executeMutation(GRAPHQL_MUTATIONS.ACCEPT_FRIEND_REQUEST, { friendRequestId: data.id });
                onRemove(data.id);
            } else {
                onRemove(data.id);
            }
        } catch (err) {
            console.error("Failed to accept invitation:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            if (data.type === "friend") {
                await executeMutation(GRAPHQL_MUTATIONS.REJECT_FRIEND_REQUEST, { friendRequestId: data.id });
                onRemove(data.id);
            } else {
                onRemove(data.id);
            }
        } catch (err) {
            console.error("Failed to reject invitation:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="invitation-card">
            <div className="info">
                <h3>{data.name}</h3>
                <span className="type">
                    {data.type === "friend" ? "Friend Request" : "Group Invite"}
                </span>
            </div>

            <div className="actions">
                <button 
                    className="accept-btn" 
                    onClick={handleAccept}
                    disabled={loading}
                >
                    {loading ? "..." : "Accept"}
                </button>
                <button 
                    className="reject-btn" 
                    onClick={handleReject}
                    disabled={loading}
                >
                    {loading ? "..." : "Reject"}
                </button>
            </div>
        </div>
    );
}