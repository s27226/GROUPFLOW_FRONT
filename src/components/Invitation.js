import React from "react";
import "../styles/Invitation.css";

export default function Invitation({data, onAccept, onReject}) {


    return (
        <div className="invitation-card">
            <div className="info">
                <h3>{data.name}</h3>
                <span className="type">
                    {data.type === "friend" ? "Friend Request" : "Group Invite"}
                </span>
            </div>

            <div className="actions">
                <button className="accept-btn" onClick={onAccept}>
                    Accept
                </button>
                <button className="reject-btn" onClick={onReject}>
                    Reject
                </button>
            </div>
        </div>
    );
}