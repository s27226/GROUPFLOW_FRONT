import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG, getRequestOptions } from "../config/api";

export const useAuthenticatedRequest = () => {
    const { updateTokens, updateUser, logout, checkAuthStatus } = useAuth();

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                ...getRequestOptions("POST", {
                    query: `
                        mutation RefreshToken {
                            auth {
                                refreshToken {
                                    id
                                    name
                                    surname
                                    nickname
                                    email
                                    profilePic
                                    token
                                    refreshToken
                                    isModerator
                                }
                            }
                        }
                    `
                })
            });

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors[0]?.message || "Failed to refresh token");
            }

            const authData = data.data.auth.refreshToken;
            updateTokens(authData.token, authData.refreshToken);
            
            // Update user data if available
            if (authData.id) {
                updateUser({
                    id: authData.id,
                    name: authData.name,
                    surname: authData.surname,
                    nickname: authData.nickname,
                    email: authData.email,
                    profilePic: authData.profilePic,
                    isModerator: authData.isModerator
                });
            }

            return authData.token;
        } catch (error) {
            console.error("Token refresh failed:", error);
            logout();
            throw error;
        }
    }, [updateTokens, updateUser, logout]);

    const makeRequest = useCallback(
        async (query, variables = {}, options = {}) => {
            const makeApiCall = async () => {
                const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                    ...getRequestOptions("POST", { query, variables })
                });

                return await response.json();
            };

            try {
                // Make request with cookies (HttpOnly cookies are automatically included)
                let data = await makeApiCall();

                // Check if we got an authentication error
                if (data.errors && data.errors.length > 0) {
                    const error = data.errors[0];
                    const isAuthError =
                        error.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
                        error.message?.toLowerCase().includes("unauthorized") ||
                        error.message?.toLowerCase().includes("expired");

                    if (isAuthError && !options.skipRetry) {
                        // Try to refresh the token using cookies
                        try {
                            await refreshAccessToken();
                            // Retry the request (cookies will be updated by server)
                            data = await makeApiCall();
                        } catch (refreshError) {
                            console.error("Failed to refresh and retry:", refreshError);
                            // Re-check auth status
                            checkAuthStatus();
                            throw refreshError;
                        }
                    }
                }

                return data;
            } catch (error) {
                console.error("Request failed:", error);
                throw error;
            }
        },
        [refreshAccessToken, checkAuthStatus]
    );

    return { makeRequest };
};
