import styles from "./ChatSideBar.module.css";

export default function ChatSideBar() {
    return (
        <div className={styles.chatboxSidebar}>
            <button className={styles.chatboxSidebarBtn}>📁 Files</button>
            <button className={`${styles.chatboxSidebarBtn} ${styles.active}`}>✉️ Messages</button>
            <button className={styles.chatboxSidebarBtn}>🕒 Termins</button>
        </div>
    );
}
