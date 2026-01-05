import { useChat } from "../hooks/useChat";

export default function ChatWindow({ user, currentUserId, onMinimize }) {
    const { messages, input, setInput, loading, sendMessage, handleKeyPress } = useChat(
        user,
        currentUserId
    );

    if (loading) {
        return (
            <div className="chat-window">
                <div className="chat-header">
                    <h3>{user.name}</h3>
                </div>
                <div className="chat-content">
                    <div className="chat-messages-area">
                        <p>Ładowanie...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h3>{user.name}</h3>
                    <div className={`chat-status-dot ${user.online ? "online" : "offline"}`}></div>
                </div>
                {onMinimize && (
                    <button
                        onClick={onMinimize}
                        className="chat-minimize-btn"
                        title="Open in popup"
                    >
                        ⤓
                    </button>
                )}
            </div>

            <div className="chat-content">
                <div className="chat-messages-area">
                    {messages.length === 0 ? (
                        <p className="no-messages">Brak wiadomości. Rozpocznij rozmowę!</p>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`priv-chat-message-wrapper ${msg.from === "me" ? "me" : "them"}`}>
                                {msg.from !== "me" && msg.sender?.profilePic && (
                                    <img 
                                        src={msg.sender.profilePic} 
                                        alt={msg.sender.nickname}
                                        className="chat-message-avatar"
                                        style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8 }}
                                    />
                                )}
                                <div
                                    className={`priv-chat-bubble ${msg.from === "me" ? "me" : "them"}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
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
