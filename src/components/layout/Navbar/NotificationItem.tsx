import styles from "./NotificationItem.module.css";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sanitizeText } from "../../../utils/sanitize";
import { getProfilePicUrl } from "../../../utils/profilePicture";
import i18n from "../../../i18n";

// Helper function to format time ago
function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return i18n.t('common.timeAgo.justNow');
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return i18n.t('common.timeAgo.minutesAgo', { count: minutes });
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return i18n.t('common.timeAgo.hoursAgo', { count: hours });
    
    const days = Math.floor(hours / 24);
    if (days < 7) return i18n.t('common.timeAgo.daysAgo', { count: days });
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return i18n.t('common.timeAgo.weeksAgo', { count: weeks });
    
    const months = Math.floor(days / 30);
    return i18n.t('common.timeAgo.monthsAgo', { count: months });
}

interface ActorUser {
    id: string;
    nickname: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface NotificationData {
    id: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    actorUser?: ActorUser;
}

interface NotificationItemProps {
    notification: NotificationData;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
    const { message, createdAt, isRead, actorUser } = notification;
    const navigate = useNavigate();
    
    const profilePic = getProfilePicUrl(actorUser?.profilePicUrl, actorUser?.nickname);
    
    return (
        <div className={`${styles.notifItem} ${!isRead ? styles.unread : ""}`} onClick={() => navigate("/profile/" + actorUser?.id)}>
            <div className={styles.notifIcon}>
                <img 
                    src={profilePic} 
                    alt={actorUser?.nickname || "User"} 
                    style={{ width: 18, height: 18, borderRadius: "50%" }}
                />
            </div>
            <div className={styles.notifInfo}>
                <p className={styles.notifText}>{sanitizeText(message)}</p>
                <span className={styles.notifTime}>{timeAgo(createdAt)}</span>
            </div>
        </div>
    );
}
