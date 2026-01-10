import { useChat } from "../../../hooks";
import { sanitizeText } from "../../../utils/sanitize";
import styles from "./ChatWindow.module.css";

interface ChatWindowUser {
    id: number;
    name: string;
    profilePic?: string;
    online?: boolean;
    nickname?: string;
}

interface ChatWindowProps {
    user: ChatWindowUser;
    currentUserId: number;
    onMinimize?: () => void;
}

export default function ChatWindow({ user, currentUserId, onMinimize }: ChatWindowProps) {
    const { messages, input, setInput, loading, sendMessage, handleKeyPress } = useChat(
        user,
        currentUserId
    );

    if (loading) {
        return (
            <div className={styles.chatWindow}>
                <div className={styles.chatHeader}>
                    <h3>{user.name}</h3>
                </div>
                <div className={styles.chatContent}>
                    <div className={styles.chatMessagesArea}>
                        <p>Ładowanie...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
                <div className={styles.chatHeaderInfo}>
                    <h3>{user.name}</h3>
                    <div className={`${styles.chatStatusDot} ${user.online ? styles.online : styles.offline}`}></div>
                </div>
                {onMinimize && (
                    <button
                        onClick={onMinimize}
                        className={styles.chatMinimizeBtn}
                        title="Open in popup"
                    >
                        ⤓
                    </button>
                )}
            </div>

            <div className={styles.chatContent}>
                <div className={styles.chatMessagesArea}>
                    {messages.length === 0 ? (
                        <p className={styles.noMessages}>Brak wiadomości. Rozpocznij rozmowę!</p>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`${styles.privChatMessageWrapper} ${msg.from === "me" ? styles.me : styles.them}`}>
                                {msg.from !== "me" && msg.sender?.profilePic && (
                                    <img 
                                        src={msg.sender.profilePic} 
                                        alt={msg.sender.nickname}
                                        className={styles.chatMessageAvatar}
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

                <div className={styles.chatInputArea}>
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
