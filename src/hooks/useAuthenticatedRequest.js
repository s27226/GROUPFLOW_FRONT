import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG, getRequestOptions } from "../config/api";

export const useAuthenticatedRequest = () => {
    const { logout, checkAuthStatus, updateUser } = useAuth();

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
            
            // Update user data
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

            return true;
        } catch (error) {
            console.error("Token refresh failed:", error);
            logout();
            throw error;
        }
    }, [updateUser, logout]);

    const makeRequest = useCallback(
        async (query, variables = {}, options = {}) => {
            try {
                // Make request - HttpOnly cookies are automatically included with credentials: 'include'
                const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                    ...getRequestOptions("POST", { query, variables })
                });

                const data = await response.json();

                // Check if we got an authentication error
                if (data.errors && data.errors.length > 0) {
                    const error = data.errors[0];
                    const isAuthError =
                        error.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
                        error.message?.toLowerCase().includes("unauthorized") ||
                        error.message?.toLowerCase().includes("expired") ||
                        error.message?.toLowerCase().includes("not authenticated");

                    if (isAuthError && !options.skipRetry) {
                        console.log("Access token expired, attempting refresh...");
                        try {
                            // Try to refresh using the refresh token
                            await refreshAccessToken();
                            
                            // Retry the original request with new access token
                            const retryResponse = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                                ...getRequestOptions("POST", { query, variables })
                            });
                            return await retryResponse.json();
                        } catch (refreshError) {
                            console.error("Failed to refresh and retry:", refreshError);
                            logout();
                            throw new Error("Session expired. Please log in again.");
                        }
                    }
                }

                return data;
            } catch (error) {
                console.error("Request failed:", error);
                throw error;
            }
        },
        [refreshAccessToken, logout]
    );

    return { makeRequest };
};
