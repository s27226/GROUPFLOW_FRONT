/**
 * Formats an ISO date string to a human-readable relative time format
 * @param {string} isoDate - ISO 8601 date string
 * @returns {string} Formatted time string (e.g., "3h ago", "2d ago")
 */
export const formatTime = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

/**
 * Formats a date string to a human-readable absolute date format
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} Formatted date string (e.g., "Jan 15, 2025")
 */
export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

/**
 * Formats a date string to include both date and time
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} Formatted date and time string (e.g., "Jan 15, 2025, 3:45 PM")
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};
