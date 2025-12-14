import { useState, useEffect, useCallback } from "react";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "./useGraphQL";

/**
 * Custom hook for fetching trending projects with pagination support
 * @param {number} pageSize - Number of projects to fetch per page (default: 5)
 * @returns {Object} - { projects, loading, error, hasMore, loadMore, refresh }
 */
export const useTrendingProjects = (pageSize = 5) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [endCursor, setEndCursor] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { executeQuery } = useGraphQL();

    const fetchProjects = useCallback(async (after = null, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            setError(null);

            const data = await executeQuery(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS, {
                first: pageSize,
                after: after
            });

            const trendingData = data.project.trendingprojects;
            const fetchedProjects = trendingData.nodes || [];
            
            const formattedProjects = fetchedProjects.map(project => ({
                id: project.id,
                name: project.name,
                description: project.description,
                image: project.imageUrl || `https://picsum.photos/60?random=${project.id}`,
                viewCount: project.viewCount,
                likeCount: project.likeCount,
                owner: project.owner
            }));

            if (append) {
                setProjects(prev => [...prev, ...formattedProjects]);
            } else {
                setProjects(formattedProjects);
            }

            setHasMore(trendingData.pageInfo.hasNextPage);
            setEndCursor(trendingData.pageInfo.endCursor);
        } catch (err) {
            console.error("Failed to fetch trending projects:", err);
            setError(err.message || "Failed to fetch trending projects");
            if (!append) {
                setProjects([]);
            }
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, [pageSize, executeQuery]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoadingMore && endCursor) {
            fetchProjects(endCursor, true);
        }
    }, [hasMore, isLoadingMore, endCursor, fetchProjects]);

    const refresh = useCallback(() => {
        setEndCursor(null);
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        isLoadingMore
    };
};
