import React, {useState} from "react";
import "../styles/ChatBox.css";


const ChatBox = () => {
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
        if (input.trim()) {
            const newMsg = {
                id: Date.now(),
                user: "Ty",
                text: input,
                avatar: "https://i.pravatar.cc/40?img=5",
                self: true,
            };

            setMessages([...messages, newMsg]);
            setInput("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { // shift+enter = nowa linia
            e.preventDefault();
            sendMessage();
        }
    };

    return (

        <div className="chatbox-all">

            <div className="chatbox-container">


                <h2 className="chatbox-title">Project 1</h2>


                <div className="chatbox-content">
                    <div className="chatbox-messages-area">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chatbox-message-row ${msg.self ? "self" : ""}`}
                            >
                                {!msg.self && (
                                    <img src={msg.avatar} alt={msg.user} className="chatbox-avatar"/>
                                )}
                                <div className="chatbox-message-content">
                                    {!msg.self && <div className="chatbox-username">{msg.user}</div>}
                                    <div className={`chatbox-message-bubble ${msg.self ? "chatbox-self-bubble" : ""}`}>
                                        {msg.text}
                                    </div>
                                </div>
                                {msg.self && (
                                    <img src={msg.avatar} alt={msg.user} className="chatbox-avatar"/>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="chatbox-input-area">
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

        </div>
    );
};

export default ChatBox;
