// API Configuration
export const API_CONFIG = {
    GRAPHQL_ENDPOINT: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    WS_ENDPOINT: import.meta.env.VITE_WS_URL || "ws://localhost:5000/graphql",
    RESET_PASSWORD_ENDPOINT: import.meta.env.VITE_RESET_PASSWORD_URL || "http://localhost:4000/api/reset-password"
};

export interface AuthHeaders {
    "Content-Type": string;
    Authorization?: string;
    [key: string]: string | undefined;
}

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
    return {
        "Content-Type": "application/json"
    };
};

interface RequestOptions {
    method: string;
    credentials: RequestCredentials;
    headers: Record<string, string>;
    body?: string;
}

// Helper function to get fetch options with credentials
export const getRequestOptions = (method = "POST", body: unknown = null): RequestOptions => {
    const options: RequestOptions = {
        method,
        credentials: "include", // Always include cookies
        headers: getAuthHeaders()
    };
    
    if (body) {
        options.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    
    return options;
};
