import "./MessagePreview.css";
import { sanitizeText } from "../../../utils/sanitize";

export default function MessagePreview({ image, name, lastMessage, time, onClick }) {
    return (
        <div className="msg-preview" onClick={onClick}>
            <img src={image} alt={name} className="msg-pfp" />
            <div className="msg-info">
                <p className="msg-name">{sanitizeText(name)}</p>
                <p className="msg-last">{sanitizeText(lastMessage)}</p>
            </div>
            <span className="msg-time">{time}</span>
        </div>
    );
}
