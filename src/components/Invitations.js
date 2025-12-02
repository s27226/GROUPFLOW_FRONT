import React, {useContext, useEffect, useState} from "react";
import "../styles/Invitation.css";
import Invitation from "./Invitation";
import {InvitationContext} from "../context/InvitationContext";


export default function Invitations() {
    const [invitations, setInvitations] = useState([
        { id: 1, name: "Jan Kowalski", type: "friend" },
        { id: 2, name: "Grupa A", type: "group" },
        { id: 3, name: "Kasia Nowak", type: "friend" },
    ]);

    const handleAccept = (id) => {
        setInvitations(prev => prev.filter(inv => inv.id !== id));
        console.log("Accepted invitation id:", id);
    };

    const handleReject = (id) => {
        setInvitations(prev => prev.filter(inv => inv.id !== id));
        console.log("Rejected invitation id:", id);

    };

    const { setInvitationsCount } = useContext(InvitationContext);

    useEffect(() => {
        setInvitationsCount(invitations.length);
        localStorage.setItem("InvitationsCount", invitations.length);
    }, [invitations]);

    return (
        <div className="invitations-container">
            {invitations.length === 0 ? (
                <p className="empty">No invitations</p>

            ) : (
                invitations.map(inv => (
                    <Invitation
                        key={inv.id}
                        data={inv}
                        onAccept={() => handleAccept(inv.id)}
                        onReject={() => handleReject(inv.id)}

                    />
                ))
            )}
        </div>
    );
}