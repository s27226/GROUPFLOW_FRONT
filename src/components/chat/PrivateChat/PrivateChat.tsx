import { useNavigate } from "react-router-dom";
import { useChat } from "../../../hooks";
import { sanitizeText } from "../../../utils/sanitize";
import { getProfilePicUrl } from "../../../utils/profilePicture";
import styles from "./PrivateChat.module.css";

interface PrivateChatUser {
    id: number;
    name: string;
    profilePic?: string;
    nickname?: string;
}

interface PrivateChatProps {
    user?: PrivateChatUser | null;
    currentUserId?: number | null;
    onClose?: () => void;
    onExpand?: () => void;
}

export default function PrivateChat({ user, currentUserId, onClose, onExpand }: PrivateChatProps) {
    const navigate = useNavigate();
    const { messages, input, setInput, loading, sendMessage, handleKeyPress } = useChat(
        user ?? null,
        currentUserId ?? null
    );

    if (!user) {
        return null;
    }

    return (
        <div className={styles.privChatWindow}>
            <div className={styles.privChatHeader}>
                <span onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: "pointer" }}>
                    {user.name}
                </span>
                <div className={styles.privChatHeaderActions}>
                    {onExpand && (
                        <button
                            onClick={onExpand}
                            title="Open in full screen"
                            className={styles.privChatExpandBtn}
                        >
                            ⛶
                        </button>
                    )}
                    <button onClick={onClose} title="Close">
                        ×
                    </button>
                </div>
            </div>

            <div className={styles.privChatBody}>
                {loading ? (
                    <p className={styles.privChatLoading}>Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className={styles.privChatNoMessages}>
                        No messages yet. Start the conversation!
                    </p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`${styles.privChatMessageWrapper} ${msg.from === "me" ? styles.me : styles.them}`}>
                            {msg.from !== "me" && (
                                <img 
                                    src={getProfilePicUrl(msg.sender?.profilePic, msg.sender?.nickname || msg.sender?.id)}
                                    alt={msg.sender?.nickname}
                                    className={styles.privChatMessageAvatar}
                                    style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8 }}
                                />
                            )}
                            <div
                                className={`${styles.privChatBubble} ${msg.from === "me" ? styles.me : styles.them}`}
                            >
                                {sanitizeText(msg.text)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.privChatInputArea}>
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
