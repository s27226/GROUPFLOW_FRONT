import i18n from '../i18n';

/**
 * Checks if a string is an error code (starts with "errors.")
 */
export const isErrorCode = (message: string): boolean => {
    return message.startsWith('errors.');
};

/**
 * Translates an error message or error code.
 * If the message is an error code (starts with "errors."), it translates it using i18n.
 * Otherwise, returns a translated fallback message (never raw error message to users).
 * 
 * Priority:
 * 1. If message is an error code (errors.XXX), translate it
 * 2. If translation not found or message is not an error code, use fallbackKey translation
 * 3. If no fallbackKey, use generic 'common.errorOccurred' translation
 * 
 * @param message - The error message or error code from the API
 * @param fallbackKey - Optional fallback i18n key if translation is not found
 * @returns Translated error message (never returns raw error message)
 */
export const translateError = (message: string, fallbackKey?: string): string => {
    const genericFallback = String(i18n.t('common.errorOccurred' as never));
    const specificFallback = fallbackKey ? String(i18n.t(fallbackKey as never)) : genericFallback;

    if (!message) {
        return specificFallback;
    }

    // If message is an error code, translate it
    if (isErrorCode(message)) {
        const translated = String(i18n.t(message as never));
        // If translation key equals the message, it means translation was not found
        // Fall back to specific fallback or generic error message
        if (translated === message) {
            return specificFallback;
        }
        return translated;
    }

    // Message is not an error code - return translated fallback, never raw message
    return specificFallback;
};

/**
 * Creates an error handler function that translates error codes
 * Useful for onError callbacks in hooks
 * 
 * @param showToast - Toast function to display the error
 * @param fallbackKey - Optional fallback i18n key
 * @returns Error handler function
 */
export const createErrorHandler = (
    showToast: (message: string, type: 'error' | 'warning' | 'success' | 'info') => void,
    fallbackKey?: string
) => {
    return (error: Error) => {
        const translatedMessage = translateError(error.message, fallbackKey);
        showToast(translatedMessage, 'error');
    };
};
