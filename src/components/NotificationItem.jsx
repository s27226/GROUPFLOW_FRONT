import "../styles/NotificationItem.css";
import { Bell } from "lucide-react";
import defaultPfp from "../images/default-pfp.png";
import { useNavigate } from "react-router-dom";
import { sanitizeText } from "../utils/sanitize";

// Helper function to format time ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "just now";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

export default function NotificationItem({ notification }) {
    const { message, createdAt, isRead, actorUser } = notification;
    const navigate = useNavigate();
    
    return (
        <div className={`notif-item ${!isRead ? "unread" : ""}`} onClick={() => navigate("/profile/" + actorUser?.id)}>
            <div className="notif-icon">
                {actorUser?.profilePic ? (
                    <img 
                        src={actorUser.profilePic} 
                        alt={actorUser.nickname} 
                        style={{ width: 18, height: 18, borderRadius: "50%" }}
                    />
                ) : (
                    <Bell size={18} />
                )}
            </div>
            <div className="notif-info">
                <p className="notif-text">{sanitizeText(message)}</p>
                <span className="notif-time">{timeAgo(createdAt)}</span>
            </div>
        </div>
    );
}
