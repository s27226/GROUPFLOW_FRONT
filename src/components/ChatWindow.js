import React, { useState } from "react";

export default function ChatWindow({ user }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            user: "Oleh",
            text: "Zwykle na maila wiadomość ma przyjść",
            avatar: "https://i.pravatar.cc/40?img=3",
            self: false,
        },
        {
            id: 2,
            user: "Ty",
            text: "Okej, dzięki za info!",
            avatar: "https://i.pravatar.cc/40?img=5",
            self: true,
        },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (input.trim() === "") return;
        setMessages([...messages, { from: "me", text: input }]);
        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>{user.name}</h3>
                <div className={`status-dot ${user.online ? "online" : "offline"}`}></div>
            </div>

            <div className="chat-content">
                <div className="messages-area">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message-row ${msg.self ? "self" : ""}`}
                        >
                            {!msg.self && (
                                <img src={msg.avatar} alt={msg.user} className="avatar"/>
                            )}
                            <div className="message-content">
                                {!msg.self && <div className="username">{msg.user}</div>}
                                <div className={`message-bubble ${msg.self ? "self-bubble" : ""}`}>
                                    {msg.text}
                                </div>
                            </div>
                            {msg.self && (
                                <img src={msg.avatar} alt={msg.user} className="avatar"/>
                            )}
                        </div>
                    ))}
                </div>

                <div className="chat-input-area">
                    <input
                        type="text"

                        placeholder="Napisz Wiadomość"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button onClick={sendMessage}>Wyślij</button>
                </div>
            </div>
        </div>
    );
}
