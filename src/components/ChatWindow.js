import React, { useState, useRef, useEffect } from "react";

export default function ChatWindow({ user }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            from: "them",
            text: "Zwykle na maila wiadomość ma przyjść",
        },
        {
            id: 2,
            from: "me",
            text: "Okej, dzięki za info!",
        },
    ]);
    const [input, setInput] = useState("");
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (input.trim() === "") return;
        setMessages([...messages, { id: Date.now(), from: "me", text: input }]);
        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>{user.name}</h3>
                <div className={`chat-status-dot ${user.online ? "online" : "offline"}`}></div>
            </div>

            <div className="chat-content">
                <div className="chat-messages-area">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-bubble ${msg.from === "me" ? "me" : "them"}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    <div ref={bottomRef} />
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
