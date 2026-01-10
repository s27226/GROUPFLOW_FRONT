import styles from "./MessagePreview.module.css";
import { sanitizeText } from "../../../utils/sanitize";

export default function MessagePreview({ image, name, lastMessage, time, onClick }) {
    return (
        <div className={styles.msgPreview} onClick={onClick}>
            <img src={image} alt={name} className={styles.msgPfp} />
            <div className={styles.msgInfo}>
                <p className={styles.msgName}>{sanitizeText(name)}</p>
                <p className={styles.msgLast}>{sanitizeText(lastMessage)}</p>
            </div>
            <span className={styles.msgTime}>{time}</span>
        </div>
    );
}
