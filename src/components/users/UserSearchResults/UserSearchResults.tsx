import LoadingSpinner from "../../ui/LoadingSpinner";
import UserCard from "../UserCard/UserCard";
import { SearchUser } from "../../../hooks/users/useUsers";
import styles from "./UserSearchResults.module.css";

interface UserSearchResultsProps {
    searchResults: SearchUser[];
    loading: boolean;
    friends: Set<string>;
    sentRequests: Set<string>;
    onSendRequest: (userId: string) => void;
    hasSearchCriteria: boolean;
}

/**
 * Component displaying search results for users
 */
export default function UserSearchResults({
    searchResults,
    loading,
    friends,
    sentRequests,
    onSendRequest,
    hasSearchCriteria
}: UserSearchResultsProps) {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (searchResults.length > 0) {
        return (
            <div className={styles.userCards}>
                {searchResults.map((result) => (
                    <UserCard
                        key={result.user.id}
                        user={result.user}
                        isFriend={friends.has(result.user.id)}
                        hasPendingRequest={sentRequests.has(result.user.id)}
                        onSendRequest={onSendRequest}
                    />
                ))}
            </div>
        );
    }

    return (
        <p className={styles.noResults}>
            {hasSearchCriteria
                ? "No users found matching your criteria."
                : "Enter search criteria to find friends."}
        </p>
    );
}
