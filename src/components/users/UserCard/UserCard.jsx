import { useNavigate } from "react-router-dom";
import "./UserCard.css";

/**
 * Individual user card component for displaying user information
 * @param {Object} props
 * @param {Object} props.user - User data
 * @param {number|null} props.matchScore - Optional match score percentage
 * @param {string|null} props.matchDetails - Optional match details text
 * @param {boolean} props.isFriend - Whether user is already a friend
 * @param {boolean} props.hasPendingRequest - Whether there's a pending friend request
 * @param {Function} props.onSendRequest - Callback when send friend request is clicked
 */
export default function UserCard({ 
    user, 
    matchScore = null, 
    matchDetails = null, 
    isFriend = false, 
    hasPendingRequest = false, 
    onSendRequest 
}) {
    const navigate = useNavigate();

    let buttonText = "Send Friend Request";
    let buttonClass = "send-request-btn";
    let isDisabled = false;

    if (isFriend) {
        buttonText = "Already Friends";
        buttonClass = "send-request-btn friends";
        isDisabled = true;
    } else if (hasPendingRequest) {
        buttonText = "Friend Request Sent";
        buttonClass = "send-request-btn request-sent";
        isDisabled = true;
    }

    return (
        <div className="user-card">
            <div 
                className="user-card-header"
                onClick={() => navigate(`/profile/${user.id}`)}
                style={{ cursor: "pointer" }}
            >
                <img
                    src={user.profilePic || `https://i.pravatar.cc/80?u=${user.id}`}
                    alt={user.nickname}
                    className="user-avatar"
                />
                <div className="user-info">
                    <h3>{user.nickname}</h3>
                    <p className="user-name">
                        {user.name} {user.surname}
                    </p>
                    {matchScore !== null && (
                        <p className="match-score">Match: {matchScore.toFixed(0)}%</p>
                    )}
                </div>
            </div>

            {matchDetails && (
                <div className="match-details">
                    <small>{matchDetails}</small>
                </div>
            )}

            {user.skills && user.skills.length > 0 && (
                <div className="user-tags">
                    <h4>Skills:</h4>
                    <div className="tags-list">
                        {user.skills.map((skill) => (
                            <span key={skill.id} className="tag skill-tag">
                                {skill.skillName}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {user.interests && user.interests.length > 0 && (
                <div className="user-tags">
                    <h4>Interests:</h4>
                    <div className="tags-list">
                        {user.interests.map((interest) => (
                            <span key={interest.id} className="tag interest-tag">
                                {interest.interestName}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button
                className={buttonClass}
                onClick={() => onSendRequest(user.id)}
                disabled={isDisabled}
            >
                {buttonText}
            </button>
        </div>
    );
}
