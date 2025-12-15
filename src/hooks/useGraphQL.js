import { useCallback } from "react";
import { useAuthenticatedRequest } from "./useAuthenticatedRequest";

/**
 * Custom hook for making GraphQL requests with automatic error handling
 * Wraps useAuthenticatedRequest to provide a simpler interface for GraphQL calls
 * @returns {Object} { executeQuery, loading, error }
 */
export const useGraphQL = () => {
    const { makeRequest } = useAuthenticatedRequest();

    /**
     * Execute a GraphQL query or mutation
     * @param {string} query - The GraphQL query or mutation string
     * @param {Object} variables - Variables for the query/mutation
     * @param {Object} options - Additional options (skipRetry, etc.)
     * @returns {Promise<Object>} The data from the GraphQL response
     * @throws {Error} If the request fails or returns errors
     */
    const executeQuery = useCallback(
        async (query, variables = {}, options = {}) => {
            try {
                const response = await makeRequest(query, variables, options);

                // Check for GraphQL errors
                if (response.errors && response.errors.length > 0) {
                    throw new Error(response.errors[0].message || "GraphQL request failed");
                }

                // Return the data portion of the response
                return response.data;
            } catch (error) {
                console.error("GraphQL request error:", error);
                throw error;
            }
        },
        [makeRequest]
    );

    /**
     * Execute a GraphQL mutation (alias for executeQuery)
     * @param {string} mutation - The GraphQL mutation string
     * @param {Object} variables - Variables for the mutation
     * @param {Object} options - Additional options (skipRetry, etc.)
     * @returns {Promise<Object>} The data from the GraphQL response
     * @throws {Error} If the request fails or returns errors
     */
    const executeMutation = executeQuery;

    return { executeQuery, executeMutation };
};
