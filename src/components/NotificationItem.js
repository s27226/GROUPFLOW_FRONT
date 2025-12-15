import "../styles/NotificationItem.css";

export default function NotificationItem({ icon, text, time, unread }) {
    return (
        <div className={`notif-item ${unread ? "unread" : ""}`}>
            <div className="notif-icon">{icon}</div>
            <div className="notif-info">
                <p className="notif-text">{text}</p>
                <span className="notif-time">{time}</span>
            </div>
        </div>
    );
}
