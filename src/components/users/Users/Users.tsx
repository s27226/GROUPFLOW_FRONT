import { useState, useEffect, useCallback } from "react";
import { GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useGraphQL, useUserSearch } from "../../../hooks";
import UserSearchFilters from "../UserSearchFilters/UserSearchFilters";
import UserSearchResults from "../UserSearchResults/UserSearchResults";
import SuggestedUsersList from "../SuggestedUsersList/SuggestedUsersList";
import styles from "./Users.module.css";

type TabType = 'search' | 'suggested';

export default function Users() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("search");
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const { executeMutation } = useGraphQL();

    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");

    // Use unified user search hook
    const { 
        results: searchResults, 
        suggestedUsers,
        loading, 
        search, 
        loadSuggested 
    } = useUserSearch({ autoFetch: true });

    // Load suggested users on mount
    useEffect(() => {
        loadSuggested(20);
        
        // Check if there's a search query from the navbar
        const storedQuery = localStorage.getItem('userSearchQuery');
        if (storedQuery) {
            setSearchTerm(storedQuery);
            search(storedQuery, selectedSkills, selectedInterests);
            localStorage.removeItem('userSearchQuery');
        }
    }, []);

    // Update state from search results
    useEffect(() => {
        if (searchResults.length > 0 || suggestedUsers.length > 0) {
            const results = activeTab === "search" ? searchResults : suggestedUsers;
            
            // Update sentRequests and friends state from backend data
            const pendingUserIds = results
                .filter((result) => result.hasPendingRequest)
                .map((result) => result.user.id);
            setSentRequests(new Set(pendingUserIds));

            const friendUserIds = results
                .filter((result) => result.isFriend)
                .map((result) => result.user.id);
            setFriends(new Set(friendUserIds));
        }
    }, [searchResults, suggestedUsers, activeTab]);

    const handleSearchWithQuery = useCallback(async (query: string | null) => {
        await search(query || searchTerm, selectedSkills, selectedInterests);
    }, [search, searchTerm, selectedSkills, selectedInterests]);

    const handleSearch = async () => {
        await handleSearchWithQuery(searchTerm);
    };

    const addSkillFilter = () => {
        if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
            setSelectedSkills([...selectedSkills, skillInput.trim()]);
            setSkillInput("");
        }
    };

    const removeSkillFilter = (skill: string): void => {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    };

    const addInterestFilter = (): void => {
        if (interestInput.trim() && !selectedInterests.includes(interestInput.trim())) {
            setSelectedInterests([...selectedInterests, interestInput.trim()]);
            setInterestInput("");
        }
    };

    const removeInterestFilter = (interest: string): void => {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    };

    const sendFriendRequest = async (userId: string): Promise<void> => {
        try {
            await executeMutation(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST, { requesteeId: userId });
            setSentRequests((prev) => new Set([...prev, userId]));
        } catch (err) {
            console.error("Failed to send friend request:", err);
        }
    };

    const hasSearchCriteria = Boolean(searchTerm) || selectedSkills.length > 0 || selectedInterests.length > 0;

    return (
        <div className={styles.usersContainer}>
            <h1>Find Friends</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "search" ? styles.active : ""}`}
                    onClick={() => setActiveTab("search")}
                >
                    Search
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "suggested" ? styles.active : ""}`}
                    onClick={() => setActiveTab("suggested")}
                >
                    Suggested for You
                </button>
            </div>

            {activeTab === "search" && (
                <>
                    <UserSearchFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        skillInput={skillInput}
                        setSkillInput={setSkillInput}
                        interestInput={interestInput}
                        setInterestInput={setInterestInput}
                        selectedSkills={selectedSkills}
                        selectedInterests={selectedInterests}
                        onSearch={handleSearch}
                        onAddSkill={addSkillFilter}
                        onRemoveSkill={removeSkillFilter}
                        onAddInterest={addInterestFilter}
                        onRemoveInterest={removeInterestFilter}
                    />
                    <div className={styles.results}>
                        <UserSearchResults
                            searchResults={searchResults}
                            loading={loading}
                            friends={friends}
                            sentRequests={sentRequests}
                            onSendRequest={sendFriendRequest}
                            hasSearchCriteria={hasSearchCriteria}
                        />
                    </div>
                </>
            )}

            {activeTab === "suggested" && (
                <div className={styles.suggestedSection}>
                    <p className={styles.suggestedDescription}>
                        Users matched based on shared skills, interests, common projects, and recent interactions:
                    </p>
                    <SuggestedUsersList
                        suggestedUsers={suggestedUsers}
                        loading={loading}
                        friends={friends}
                        sentRequests={sentRequests}
                        onSendRequest={sendFriendRequest}
                    />
                </div>
            )}
        </div>
    );
}
