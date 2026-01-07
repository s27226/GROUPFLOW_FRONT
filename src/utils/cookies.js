// Cookie utilities for secure token management

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
};

export const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=none`;
};

// For dev purposes only - HttpOnly cookies can't be read by JS in production
export const isTokenAvailable = () => {
    return document.cookie.includes('access_token') || document.cookie.includes('refresh_token');
};

export const clearAuthCookies = () => {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
};