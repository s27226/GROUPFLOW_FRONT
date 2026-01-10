import { useNavigate } from "react-router-dom";
import styles from "./UserCard.module.css";

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
    let buttonClass = styles.sendRequestBtn;
    let isDisabled = false;

    if (isFriend) {
        buttonText = "Already Friends";
        buttonClass = `${styles.sendRequestBtn} ${styles.friends}`;
        isDisabled = true;
    } else if (hasPendingRequest) {
        buttonText = "Friend Request Sent";
        buttonClass = `${styles.sendRequestBtn} ${styles.requestSent}`;
        isDisabled = true;
    }

    return (
        <div className={styles.userCard}>
            <div 
                className={styles.userCardHeader}
                onClick={() => navigate(`/profile/${user.id}`)}
                style={{ cursor: "pointer" }}
            >
                <img
                    src={user.profilePic || `https://i.pravatar.cc/80?u=${user.id}`}
                    alt={user.nickname}
                    className={styles.userAvatar}
                />
                <div className={styles.userInfo}>
                    <h3>{user.nickname}</h3>
                    <p className={styles.userName}>
                        {user.name} {user.surname}
                    </p>
                    {matchScore !== null && (
                        <p className={styles.matchScore}>Match: {matchScore.toFixed(0)}%</p>
                    )}
                </div>
            </div>

            {matchDetails && (
                <div className={styles.matchDetails}>
                    <small>{matchDetails}</small>
                </div>
            )}

            {user.skills && user.skills.length > 0 && (
                <div className={styles.userTags}>
                    <h4>Skills:</h4>
                    <div className={styles.tagsList}>
                        {user.skills.map((skill) => (
                            <span key={skill.id} className={`${styles.tag} ${styles.skillTag}`}>
                                {skill.skillName}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {user.interests && user.interests.length > 0 && (
                <div className={styles.userTags}>
                    <h4>Interests:</h4>
                    <div className={styles.tagsList}>
                        {user.interests.map((interest) => (
                            <span key={interest.id} className={`${styles.tag} ${styles.interestTag}`}>
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
