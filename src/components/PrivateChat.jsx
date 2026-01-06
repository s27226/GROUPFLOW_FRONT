import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { sanitizeText } from "../utils/sanitize";
import "../styles/PrivateChat.css";

export default function PrivateChat({ user, currentUserId, onClose, onExpand }) {
    const navigate = useNavigate();
    const { messages, input, setInput, loading, sendMessage, handleKeyPress } = useChat(
        user,
        currentUserId
    );

    return (
        <div className="priv-chat-window">
            <div className="priv-chat-header">
                <span onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: "pointer" }}>
                    {user.name}
                </span>
                <div className="priv-chat-header-actions">
                    {onExpand && (
                        <button
                            onClick={onExpand}
                            title="Open in full screen"
                            className="priv-chat-expand-btn"
                        >
                            ⛶
                        </button>
                    )}
                    <button onClick={onClose} title="Close">
                        ×
                    </button>
                </div>
            </div>

            <div className="priv-chat-body">
                {loading ? (
                    <p className="priv-chat-loading">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="priv-chat-no-messages">
                        No messages yet. Start the conversation!
                    </p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`priv-chat-message-wrapper ${msg.from === "me" ? "me" : "them"}`}>
                            {msg.from !== "me" && msg.sender?.profilePic && (
                                <img 
                                    src={msg.sender.profilePic} 
                                    alt={msg.sender.nickname}
                                    className="priv-chat-message-avatar"
                                    style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8 }}
                                />
                            )}
                            <div
                                className={`priv-chat-bubble ${msg.from === "me" ? "me" : "them"}`}
                            >
                                {sanitizeText(msg.text)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="priv-chat-input-area">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
}
