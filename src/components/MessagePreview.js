import "../styles/MessagePreview.css";

export default function MessagePreview({ image, name, lastMessage, time, onClick }) {
    return (
        <div className="msg-preview" onClick={onClick}>
            <img src={image} alt={name} className="msg-pfp" />
            <div className="msg-info">
                <p className="msg-name">{name}</p>
                <p className="msg-last">{lastMessage}</p>
            </div>
            <span className="msg-time">{time}</span>
        </div>
    );
}
