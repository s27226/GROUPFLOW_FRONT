import DOMPurify from 'dompurify';

interface SanitizeOptions {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    KEEP_CONTENT?: boolean;
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} dirty - The unsanitized user input
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - Sanitized safe string
 */
export const sanitizeText = (dirty: string | null | undefined, options: SanitizeOptions = {}): string => {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const defaultOptions = {
        ALLOWED_TAGS: [], // No HTML tags allowed by default - only plain text
        ALLOWED_ATTR: [], // No attributes allowed
        KEEP_CONTENT: true, // Keep text content even when removing tags
        ...options
    };

    return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Sanitizes HTML content allowing basic formatting tags
 * Use this only when you intentionally want to allow some HTML formatting
 * @param {string} dirty - The unsanitized HTML content
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (dirty: string | null | undefined): string => {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const options = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SAFE_FOR_TEMPLATES: true
    };

    return DOMPurify.sanitize(dirty, options);
};

/**
 * React component helper to safely render text content
 * Use this to prevent XSS when displaying user-generated content
 * @param {string} text - The text to sanitize
 * @returns {Object} - Object with __html property for dangerouslySetInnerHTML
 */
export const createSafeHTML = (text: string | null | undefined): { __html: string } => {
    return {
        __html: sanitizeText(text)
    };
};
