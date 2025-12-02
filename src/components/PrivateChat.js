import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PrivateChat.css";

export default function PrivateChat({ user, onClose }) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { from: "them", text: "Hope this doesnt break anythin" },
        { from: "me", text: "Test" },
        { from: "them", text: "Men" },
    ]);
    const [input, setInput] = useState("");
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { from: "me", text: input }]);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="priv-chat-window">
            <div className="priv-chat-header">
                <span onClick={() => navigate("/profile")} style={{cursor: "pointer"}}>{user.name}</span>
                <button onClick={onClose}>×</button>
            </div>

            <div className="priv-chat-body">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`priv-chat-bubble ${msg.from === "me" ? "me" : "them"}`}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="priv-chat-input-area">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}
