import styles from "./MessagePreview.module.css";
import { sanitizeText } from "../../../utils/sanitize";

interface MessagePreviewProps {
    image: string;
    name: string;
    lastMessage: string;
    time: string;
    onClick: () => void;
}

export default function MessagePreview({ image, name, lastMessage, time, onClick }: MessagePreviewProps) {
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
