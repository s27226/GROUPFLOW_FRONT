import LoadingSpinner from "../../ui/LoadingSpinner";
import UserCard from "../UserCard/UserCard";

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
}) {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (searchResults.length > 0) {
        return (
            <div className="user-cards">
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
        <p className="no-results">
            {hasSearchCriteria
                ? "No users found matching your criteria."
                : "Enter search criteria to find friends."}
        </p>
    );
}
