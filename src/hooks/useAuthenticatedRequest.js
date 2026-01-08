import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG, getRequestOptions } from "../config/api";

export const useAuthenticatedRequest = () => {
    const { logout, refreshAccessToken } = useAuth();

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
                    const errorMessage = error.message?.toLowerCase() || "";
                    const errorCode = error.extensions?.code;
                    
                    const isAuthError =
                        errorCode === "AUTH_NOT_AUTHENTICATED" ||
                        errorCode === "UNAUTHORIZED" ||
                        errorMessage.includes("unauthorized") ||
                        errorMessage.includes("expired") ||
                        errorMessage.includes("not authenticated") ||
                        errorMessage.includes("unexpected execution error"); // Backend returns this for missing auth

                    console.log("[makeRequest] Error detected:", error.message, "code:", errorCode, "isAuthError:", isAuthError);

                    if (isAuthError && !options.skipRetry) {
                        console.log("Access token expired, attempting refresh...");
                        try {
                            // Try to refresh using the refresh token from AuthContext
                            const refreshed = await refreshAccessToken();
                            
                            if (!refreshed) {
                                console.error("Token refresh returned false");
                                throw new Error("Token refresh failed");
                            }
                            
                            console.log("Token refreshed successfully, retrying request...");
                            
                            // Retry the original request with new access token
                            const retryResponse = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                                ...getRequestOptions("POST", { query, variables })
                            });
                            const retryData = await retryResponse.json();
                            
                            console.log("Retry response received:", retryData.errors ? "has errors" : "success");
                            
                            return retryData;
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
