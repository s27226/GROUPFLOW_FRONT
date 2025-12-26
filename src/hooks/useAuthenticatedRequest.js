import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG } from "../config/api";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";

export const useAuthenticatedRequest = () => {
    const { token, refreshToken, updateTokens, updateUser, logout } = useAuth();

    const refreshAccessToken = useCallback(async () => {
        if (!refreshToken) {
            logout();
            throw new Error("No refresh token available");
        }

        try {
            const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: GRAPHQL_MUTATIONS.REFRESH_TOKEN,
                    variables: { refreshToken }
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
    }, [refreshToken, updateTokens, updateUser, logout]);

    const makeRequest = useCallback(
        async (query, variables = {}, options = {}) => {
            const makeApiCall = async (authToken) => {
                const headers = {
                    "Content-Type": "application/json",
                    ...(authToken && { Authorization: `Bearer ${authToken}` })
                };

                const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ query, variables })
                });

                return await response.json();
            };

            try {
                // First attempt with current token
                let data = await makeApiCall(token);

                // Check if we got an authentication error
                if (data.errors && data.errors.length > 0) {
                    const error = data.errors[0];
                    const isAuthError =
                        error.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
                        error.message?.toLowerCase().includes("unauthorized") ||
                        error.message?.toLowerCase().includes("expired");

                    if (isAuthError && !options.skipRetry) {
                        // Try to refresh the token
                        try {
                            const newToken = await refreshAccessToken();
                            // Retry the request with the new token
                            data = await makeApiCall(newToken);
                        } catch (refreshError) {
                            console.error("Failed to refresh and retry:", refreshError);
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
        [token, refreshAccessToken]
    );

    return { makeRequest, refreshAccessToken };
};
