import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProfilePicUrl } from "../../../utils/profilePicture";
import styles from "./UserCard.module.css";

interface Skill {
    id: string;
    skillName: string;
}

interface Interest {
    id: string;
    interestName: string;
}

interface UserData {
    id: string;
    name?: string;
    surname?: string;
    nickname: string;
    profilePic?: string;
    profilePicUrl?: string;
    skills?: Skill[];
    interests?: Interest[];
}

interface UserCardProps {
    user: UserData;
    matchScore?: number | null;
    matchDetails?: string | null;
    isFriend?: boolean;
    hasPendingRequest?: boolean;
    onSendRequest: (userId: string) => void;
}

/**
 * Individual user card component for displaying user information
 */
export default function UserCard({ 
    user, 
    matchScore = null, 
    matchDetails = null, 
    isFriend = false, 
    hasPendingRequest = false, 
    onSendRequest 
}: UserCardProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    let buttonText = t('users.sendFriendRequest');
    let buttonClass = styles.sendRequestBtn;
    let isDisabled = false;

    if (isFriend) {
        buttonText = t('users.alreadyFriends');
        buttonClass = `${styles.sendRequestBtn} ${styles.friends}`;
        isDisabled = true;
    } else if (hasPendingRequest) {
        buttonText = t('users.friendRequestSent');
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
                    src={getProfilePicUrl(user.profilePicUrl, user.nickname || user.id)}
                    alt={user.nickname}
                    className={styles.userAvatar}
                />
                <div className={styles.userInfo}>
                    <h3>{user.nickname}</h3>
                    <p className={styles.userName}>
                        {user.name} {user.surname}
                    </p>
                    {matchScore !== null && (
                        <p className={styles.matchScore}>{t('users.match')}: {matchScore.toFixed(0)}%</p>
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
                    <h4>{t('users.skills')}:</h4>
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
                    <h4>{t('users.interests')}:</h4>
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
