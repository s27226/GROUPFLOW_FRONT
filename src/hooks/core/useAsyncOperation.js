import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for handling async operations with unified loading/error state management.
 * Eliminates the need for repeated try-catch-setLoading patterns throughout the codebase.
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback called on successful operation
 * @param {Function} options.onError - Callback called on error (receives error)
 * @param {boolean} options.resetErrorOnExecute - Whether to reset error state when executing (default: true)
 * @returns {Object} { execute, loading, error, reset, setError }
 * 
 * @example
 * const { execute, loading, error } = useAsyncOperation();
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(async () => {
 *     return await api.createPost(data);
 *   });
 *   if (result) {
 *     navigate('/posts');
 *   }
 * };
 */
export const useAsyncOperation = (options = {}) => {
    const { 
        onSuccess, 
        onError, 
        resetErrorOnExecute = true 
    } = options;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    
    // Store callbacks in refs to avoid dependency issues
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    
    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    });

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    /**
     * Execute an async operation with automatic loading and error handling
     * @param {Function} operation - The async function to execute
     * @param {Object} executeOptions - Options for this specific execution
     * @param {boolean} executeOptions.showLoading - Whether to show loading state (default: true)
     * @returns {Promise<any>} The result of the operation, or null if failed
     */
    const execute = useCallback(async (operation, executeOptions = {}) => {
        const { showLoading = true } = executeOptions;
        
        if (resetErrorOnExecute) {
            setError(null);
        }
        
        if (showLoading) {
            setLoading(true);
        }
        
        try {
            const result = await operation();
            
            if (mountedRef.current) {
                if (showLoading) {
                    setLoading(false);
                }
                if (onSuccessRef.current) {
                    onSuccessRef.current(result);
                }
            }
            
            return result;
        } catch (err) {
            if (mountedRef.current) {
                const errorMessage = err?.message || "An unexpected error occurred";
                setError(errorMessage);
                if (showLoading) {
                    setLoading(false);
                }
                if (onErrorRef.current) {
                    onErrorRef.current(err);
                }
            }
            console.error("Async operation error:", err);
            return null;
        }
    }, [resetErrorOnExecute]);

    /**
     * Reset the loading and error states
     */
    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
    }, []);

    return {
        execute,
        loading,
        error,
        reset,
        setError,
        setLoading
    };
};

/**
 * Custom hook for data fetching with automatic loading/error/data state management.
 * Built on top of useAsyncOperation for consistent behavior.
 * 
 * @param {Function} fetchFn - The function that fetches data
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch automatically on mount (default: true)
 * @param {boolean} options.skip - Whether to skip fetching (default: false)
 * @param {any} options.initialData - Initial data value (default: null)
 * @param {Array} options.dependencies - Additional dependencies for auto-fetch
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on fetch error
 * @param {Function} options.transform - Function to transform the fetched data
 * @returns {Object} { data, loading, error, refetch, setData, reset }
 * 
 * @example
 * const { data: posts, loading, error, refetch } = useFetch(
 *   () => executeQuery(GET_POSTS),
 *   { autoFetch: true, initialData: [] }
 * );
 */
export const useFetch = (fetchFn, options = {}) => {
    const {
        autoFetch = true,
        skip = false,
        initialData = null,
        dependencies = [],
        onSuccess,
        onError,
        transform
    } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(!skip && autoFetch);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    const hasFetched = useRef(false);
    
    // Store callbacks in refs to avoid dependency issues
    const fetchFnRef = useRef(fetchFn);
    const transformRef = useRef(transform);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    
    useEffect(() => {
        fetchFnRef.current = fetchFn;
        transformRef.current = transform;
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    });

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const fetchedData = await fetchFnRef.current();
            const result = transformRef.current ? transformRef.current(fetchedData) : fetchedData;
            
            if (mountedRef.current) {
                setData(result);
                setLoading(false);
                
                if (onSuccessRef.current) {
                    onSuccessRef.current(result);
                }
            }
            
            return result;
        } catch (err) {
            if (mountedRef.current) {
                const errorMessage = err?.message || "An unexpected error occurred";
                setError(errorMessage);
                setLoading(false);
                
                if (onErrorRef.current) {
                    onErrorRef.current(err);
                }
            }
            console.error("Fetch error:", err);
            return null;
        }
    }, []);

    // Auto-fetch on mount if enabled and not skipped
    useEffect(() => {
        if (autoFetch && !skip && !hasFetched.current) {
            hasFetched.current = true;
            fetch();
        }
    }, [autoFetch, skip, fetch]);

    // Reset hasFetched when skip changes
    useEffect(() => {
        if (skip) {
            hasFetched.current = false;
        }
    }, [skip]);

    const reset = useCallback(() => {
        setData(initialData);
        setLoading(false);
        setError(null);
    }, [initialData]);

    return {
        data,
        loading,
        error,
        refetch: fetch,
        setData,
        reset,
        setError
    };
};

/**
 * Custom hook for mutation operations with loading/error state.
 * Similar to useFetch but designed for operations that modify data.
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback on successful mutation
 * @param {Function} options.onError - Callback on mutation error
 * @returns {Object} { execute, loading, error, reset }
 * 
 * @example
 * const { execute, loading } = useMutation({
 *   onSuccess: () => showToast('Post created!'),
 *   onError: (err) => showToast(err.message, 'error')
 * });
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(async () => {
 *     return await api.createPost({ title, content });
 *   });
 *   if (result) navigate('/posts');
 * };
 */
export const useMutation = (options = {}) => {
    const { onSuccess, onError } = options;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    
    // Store callbacks in refs to avoid dependency issues
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    
    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    });

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const execute = useCallback(async (operation) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await operation();
            
            if (mountedRef.current) {
                setLoading(false);
                if (onSuccessRef.current) {
                    onSuccessRef.current(result);
                }
            }
            
            return result;
        } catch (err) {
            if (mountedRef.current) {
                const errorMessage = err?.message || "An unexpected error occurred";
                setError(errorMessage);
                setLoading(false);
                
                if (onErrorRef.current) {
                    onErrorRef.current(err);
                }
            }
            console.error("Mutation error:", err);
            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
    }, []);

    return {
        execute,
        loading,
        error,
        reset,
        setError
    };
};

export default useAsyncOperation;
