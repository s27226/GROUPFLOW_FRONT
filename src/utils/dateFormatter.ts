import i18n from '../i18n';

/**
 * Formats an ISO date string to a human-readable relative time format
 * @param {string} isoDate - ISO 8601 date string
 * @returns {string} Formatted time string (e.g., "3h ago", "2d ago")
 */
export const formatTime = (isoDate: string | null | undefined): string => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // difference in seconds

    if (diff < 60) return i18n.t('common.timeAgo.justNow');
    if (diff < 3600) return i18n.t('common.timeAgo.minutesAgo', { count: Math.floor(diff / 60) });
    if (diff < 86400) return i18n.t('common.timeAgo.hoursAgo', { count: Math.floor(diff / 3600) });
    if (diff < 604800) return i18n.t('common.timeAgo.daysAgo', { count: Math.floor(diff / 86400) });
    if (diff < 2592000) return i18n.t('common.timeAgo.weeksAgo', { count: Math.floor(diff / 604800) });
    return i18n.t('common.timeAgo.monthsAgo', { count: Math.floor(diff / 2592000) });
};

/**
 * Formats a date string to a human-readable absolute date format
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} Formatted date string (e.g., "Jan 15, 2025")
 */
export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

/**
 * Formats a date string to include both date and time
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} Formatted date and time string (e.g., "Jan 15, 2025, 3:45 PM")
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
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
