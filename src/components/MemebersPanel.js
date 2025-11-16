import "../styles/MembersPanel.css"
import React from "react";



export default function MemebersPanel() {

    const members = [
        { id: 1, name: "Jan Kowalski", status: "available",avatar: "https://i.pravatar.cc/40?img=3", },
        { id: 2, name: "Kasia Nowak", status: "away",avatar: "https://i.pravatar.cc/40?img=3", },
        { id: 3, name: "Piotr Zieliński", status: "offline",avatar: "https://i.pravatar.cc/40?img=3", },
    ];

    return (
        <div className="project-members-panel">
            <h3>Członkowie projektu</h3>
            <div className="members-list">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className={`member-item ${member.status}`}

                    >

                        <div className="member-header">
                            <img src={member.avatar} alt={member.name} className="member-avatar"/>

                            <span className="status-dot"/>
                            <span className="member-name">{member.name}</span>

                        </div>
                        <span className="status-text">
              {member.status === "available"
                  ? "Dostępny"
                  : member.status === "away"
                      ? "Za chwilę wracam"
                      : "Niedostępny"}
            </span>
                    </div>
                ))}
            </div>


        </div>
    );
}



