import styles from "./ChatList.module.css";

export default function ChatList({ users, onSelectUser, selectedUser }) {
    return (
        <div className={styles.chatList}>
            <h3 className={styles.textCenter}> Friends </h3>
            <ul>
                {users.map((u) => (
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
