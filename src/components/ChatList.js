import React from "react";

export default function ChatList({ users, onSelectUser, selectedUser }) {
    return (
        <div className="chat-list">
            <h3> Użytkownicy</h3>
            <ul>
                {users.map((u) => (
                    <li
                        key={u.id}
                        onClick={() => onSelectUser(u)}
                        className={selectedUser?.id === u.id ? "active" : ""}
                    >
                        <div className="user-info">
                            <div className={`status ${u.online ? "online" : "offline"}`}></div>
                            <span>{u.name}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}