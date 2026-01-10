import styles from "./ChatList.module.css";

interface ChatListUser {
    id: string;
    name: string;
    profilePic?: string;
    online?: boolean;
}

interface ChatListProps {
    users: ChatListUser[];
    onSelectUser: (user: ChatListUser) => void;
    selectedUser?: ChatListUser | null;
}

export default function ChatList({ users, onSelectUser, selectedUser }: ChatListProps) {
    return (
        <div className={styles.chatList}>
            <h3 className={styles.textCenter}> Friends </h3>
            <ul>
                {users.map((u: ChatListUser) => (
                    <li
                        key={u.id}
                        onClick={() => onSelectUser(u)}
                        className={selectedUser?.id === u.id ? styles.active : ""}
                    >
                        <div className={styles.chatUserInfo}>
                            {u.profilePic && (
                                <img 
                                    src={u.profilePic} 
                                    alt={u.name} 
                                    className={styles.chatUserAvatar}
                                />
                            )}
                            <div className={`${styles.chatStatus} ${u.online ? styles.online : styles.offline}`}></div>
                            <span>{u.name}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
