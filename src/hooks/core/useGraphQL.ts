import { useState, useCallback, useEffect, useRef } from "react";
import { useAuthenticatedRequest } from "./useAuthenticatedRequest";

interface GraphQLResponse<T = unknown> {
    data?: T;
    errors?: Array<{ message: string }>;
}

interface QueryOptions<T = unknown> {
    skip?: boolean;
    autoFetch?: boolean;
    initialData?: T | null;
    transform?: (data: unknown) => T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

interface MutationOptions<T = unknown> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    transform?: (data: unknown) => T;
}

/**
 * Custom hook for making GraphQL requests with automatic error handling
 * Wraps useAuthenticatedRequest to provide a simpler interface for GraphQL calls
 * @returns {Object} { executeQuery, executeMutation }
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
        async <T = unknown>(query: string, variables: Record<string, unknown> = {}, options: Record<string, unknown> = {}): Promise<T> => {
            try {
                const response = await makeRequest(query, variables, options) as GraphQLResponse<T>;

                // Check for GraphQL errors
                if (response.errors && response.errors.length > 0) {
                    throw new Error(response.errors[0].message || "GraphQL request failed");
                }

                // Return the data portion of the response
                return response.data as T;
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

/**
 * Custom hook for GraphQL queries with automatic loading/error/data state management.
 * Provides a unified way to handle data fetching with consistent patterns.
 * 
 * @param {string} query - The GraphQL query string
 * @param {Object} variables - Query variables (optional, can also be passed in options)
 * @param {Object} options - Configuration options
 * @param {boolean} options.skip - Whether to skip the query (default: false)
 * @param {boolean} options.autoFetch - Whether to fetch automatically on mount (default: true)
 * @param {any} options.initialData - Initial data value (default: null)
 * @param {Function} options.transform - Function to transform the fetched data
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on fetch error
 * @returns {Object} { data, loading, error, refetch, setData }
 * 
 * @example
 * const { data, loading, error, refetch } = useQuery(GET_POSTS, { first: 10 }, {
 *   transform: (data) => data.posts.allposts,
 *   initialData: []
 * });
 */
export const useQuery = <T = unknown>(query: string, variables: Record<string, unknown> = {}, options: QueryOptions<T> = {}) => {
    const {
        skip = false,
        autoFetch = true,
        initialData = null,
        transform,
        onSuccess,
        onError
    } = options;

    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState(!skip && autoFetch);
    const [error, setError] = useState<string | null>(null);
    const { executeQuery } = useGraphQL();
    const hasFetched = useRef(false);
    
    // Store callbacks in refs to avoid dependency issues
    const transformRef = useRef(transform);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    
    // Update refs when callbacks change
    useEffect(() => {
        transformRef.current = transform;
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    });

    // Serialize variables for dependency comparison
    const variablesKey = JSON.stringify(variables);

    const fetch = useCallback(async (fetchVariables?: Record<string, unknown>): Promise<T | null> => {
        const vars = fetchVariables || JSON.parse(variablesKey);
        
        setLoading(true);
        setError(null);
        
        try {
            const result = await executeQuery(query, vars);
            const transformedData = transformRef.current ? transformRef.current(result) : result as T;
            setData(transformedData);
            
            if (onSuccessRef.current) {
                onSuccessRef.current(transformedData);
            }
            
            return transformedData;
        } catch (err) {
            const errorMessage = (err as Error)?.message || "An unexpected error occurred";
            setError(errorMessage);
            
            if (onErrorRef.current) {
                onErrorRef.current(err as Error);
            }
            
            return null;
        } finally {
            setLoading(false);
        }
    }, [executeQuery, query, variablesKey]);

    // Auto-fetch on mount if enabled and not skipped
    useEffect(() => {
        if (autoFetch && !skip && !hasFetched.current) {
            hasFetched.current = true;
            fetch();
        }
    }, [autoFetch, skip, fetch]);

    // Reset hasFetched when skip changes to allow refetch
    useEffect(() => {
        if (skip) {
            hasFetched.current = false;
        }
    }, [skip]);

    return {
        data,
        loading,
        error,
        refetch: fetch,
        setData,
        setError
    };
};

/**
 * Custom hook for GraphQL mutations with loading/error state management.
 * Provides a unified way to handle mutations with consistent patterns.
 * 
 * Supports two usage patterns:
 * 1. With mutation upfront: useMutationQuery(MUTATION, options) -> mutate(variables)
 * 2. Without mutation: useMutationQuery(options) -> execute(mutation, variables)
 * 
 * @param {string|Object} mutationOrOptions - The GraphQL mutation string OR options object
 * @param {Object} options - Configuration options (when first arg is mutation)
 * @param {Function} options.onSuccess - Callback on successful mutation (receives result)
 * @param {Function} options.onError - Callback on mutation error (receives error)
 * @param {Function} options.transform - Function to transform the mutation result
 * @returns {Object} { mutate, execute, loading, error, reset, data }
 * 
 * @example
 * // Pattern 1: With mutation upfront
 * const { mutate, loading } = useMutationQuery(CREATE_POST, {
 *   onSuccess: (data) => showToast('Post created!')
 * });
 * await mutate({ input: { title, content } });
 * 
 * // Pattern 2: Dynamic mutations
 * const { execute, loading } = useMutationQuery({
 *   onError: (err) => showToast(err.message, 'error')
 * });
 * await execute(DELETE_POST, { id: postId });
 */
export const useMutationQuery = <T = unknown>(mutationOrOptions?: string | MutationOptions<T>, optionsArg: MutationOptions<T> = {}) => {
    // Detect which pattern is being used
    const isOptionsFirst = typeof mutationOrOptions === 'object' && mutationOrOptions !== null;
    const mutation = isOptionsFirst ? null : mutationOrOptions as string;
    const options = isOptionsFirst ? mutationOrOptions as MutationOptions<T> : optionsArg;
    
    const { onSuccess, onError, transform } = options;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);
    const { executeMutation: graphqlMutation } = useGraphQL();

    // Store callbacks in refs to avoid dependency issues
    const transformRef = useRef(transform);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    
    useEffect(() => {
        transformRef.current = transform;
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    });

    // Execute function for dynamic mutations (Pattern 2)
    const execute = useCallback(async (dynamicMutation: string, variables: Record<string, unknown> = {}): Promise<T | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await graphqlMutation(dynamicMutation, variables);
            const transformedData = transformRef.current ? transformRef.current(result) : result as T;
            setData(transformedData);
            
            if (onSuccessRef.current) {
                onSuccessRef.current(transformedData);
            }
            
            return transformedData;
        } catch (err) {
            const errorMessage = (err as Error)?.message || "An unexpected error occurred";
            setError(errorMessage);
            
            if (onErrorRef.current) {
                onErrorRef.current(err as Error);
            }
            
            return null;
        } finally {
            setLoading(false);
        }
    }, [graphqlMutation]);

    // Mutate function for predefined mutations (Pattern 1)
    const mutate = useCallback(async (variables: Record<string, unknown> = {}): Promise<T | null> => {
        if (!mutation) {
            throw new Error("useMutationQuery: No mutation provided. Use execute(mutation, variables) instead.");
        }
        return execute(mutation, variables);
    }, [mutation, execute]);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        mutate,
        execute,
        loading,
        error,
        reset,
        data
    };
};

