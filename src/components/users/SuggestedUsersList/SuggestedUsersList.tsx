import LoadingSpinner from "../../ui/LoadingSpinner";
import UserCard from "../UserCard/UserCard";
import { SearchUser } from "../../../hooks/users/useUsers";
import styles from "./SuggestedUsersList.module.css";

interface SuggestedUsersListProps {
    suggestedUsers: SearchUser[];
    loading: boolean;
    friends: Set<string>;
    sentRequests: Set<string>;
    onSendRequest: (userId: string) => void;
}

/**
 * Component displaying suggested users based on matching criteria
 */
export default function SuggestedUsersList({
    suggestedUsers,
    loading,
    friends,
    sentRequests,
    onSendRequest
}: SuggestedUsersListProps) {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (suggestedUsers.length === 0) {
        return (
            <p className={styles.noResults}>
                No suggestions available. Add skills and interests to your profile to
                get personalized recommendations!
            </p>
        );
    }

    return (
        <div className={styles.userCards}>
            {suggestedUsers.map(
                ({ user, matchScore = 0, commonSkills = 0, commonInterests = 0, commonProjects = 0, recentInteractions = 0 }) => {
                    const details = [];
                    if (commonSkills > 0) {
                        details.push(`${commonSkills} common skill${commonSkills > 1 ? "s" : ""}`);
                    }
                    if (commonInterests > 0) {
                        details.push(`${commonInterests} common interest${commonInterests > 1 ? "s" : ""}`);
                    }
                    if (commonProjects > 0) {
                        details.push(`${commonProjects} shared project${commonProjects > 1 ? "s" : ""}`);
                    }
                    if (recentInteractions > 0) {
                        details.push(`${recentInteractions} recent interaction${recentInteractions > 1 ? "s" : ""}`);
                    }
                    
                    const matchDetailsText = details.length > 0 ? details.join(", ") : null;
                    
                    return (
                        <UserCard
                            key={user.id}
                            user={user}
                            matchScore={matchScore}
                            matchDetails={matchDetailsText}
                            isFriend={friends.has(user.id)}
                            hasPendingRequest={sentRequests.has(user.id)}
                            onSendRequest={onSendRequest}
                        />
                    );
                }
            )}
        </div>
    );
}
