import { useState, useEffect } from "react";

/**
 * Custom hook to listen for search query changes from localStorage
 * Handles localStorage changes across tabs and within the same tab
 * @returns {string} The current search query (cleaned and lowercased)
 */
export const useSearchQuery = () => {
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const handleStorageChange = () => {
            const storedQuery = localStorage.getItem("searchQuery") || "";
            // Clean the query by removing quotes and trimming
            const cleanedQuery = storedQuery.toLowerCase().trim().slice(1, -1);
            setSearchQuery(cleanedQuery);
        };

        // Initial load
        handleStorageChange();

        // Listen for storage events (cross-tab)
        window.addEventListener("storage", handleStorageChange);

        // Poll for changes since storage event doesn't fire in same tab
        const interval = setInterval(handleStorageChange, 500);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    return searchQuery;
};
