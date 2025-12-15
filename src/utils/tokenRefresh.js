import { API_CONFIG } from "./api";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

export const refreshAccessToken = async (refreshToken) => {
    const mutation = `
    mutation RefreshToken($refreshToken: String!) {
      refreshToken(refreshToken: $refreshToken) {
        id
        name
        email
        token
        refreshToken
      }
    }
  `;

    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: mutation,
            variables: { refreshToken }
        })
    });

    const data = await response.json();

    if (data.errors) {
        throw new Error(data.errors[0]?.message || "Failed to refresh token");
    }

    return data.data.refreshToken;
};

export const setupTokenRefresh = (updateTokensFn, logoutFn) => {
    return async (error, originalRequest) => {
        if (
            error?.extensions?.code === "AUTH_NOT_AUTHENTICATED" ||
            error?.message?.includes("unauthorized") ||
            error?.message?.includes("expired")
        ) {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                logoutFn();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        return { token, retry: true };
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                const authData = await refreshAccessToken(refreshToken);
                updateTokensFn(authData.token, authData.refreshToken);
                processQueue(null, authData.token);
                isRefreshing = false;
                return { token: authData.token, retry: true };
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                logoutFn();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    };
};

export const makeAuthenticatedRequest = async (query, variables = {}, updateTokensFn, logoutFn) => {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
    };

    try {
        const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
            method: "POST",
            headers,
            body: JSON.stringify({ query, variables })
        });

        const data = await response.json();

        if (data.errors && data.errors.length > 0) {
            const error = data.errors[0];

            // Try to refresh token if authentication error
            const refreshResult = await setupTokenRefresh(updateTokensFn, logoutFn)(error);

            if (refreshResult.retry) {
                // Retry the original request with new token
                const retryResponse = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${refreshResult.token}`
                    },
                    body: JSON.stringify({ query, variables })
                });

                return await retryResponse.json();
            }
        }

        return data;
    } catch (error) {
        console.error("Request failed:", error);
        throw error;
    }
};
