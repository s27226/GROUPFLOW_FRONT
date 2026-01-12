import { useState, useEffect, useCallback, useRef } from "react";
import { GRAPHQL_QUERIES } from "../../queries/graphql";
import { useGraphQL, useQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { getProjectImageUrl } from "../../utils/profilePicture";

interface ProjectOwner {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface RawProject {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    views?: unknown[];
    likes?: unknown[];
    owner?: ProjectOwner;
}

interface FormattedProject {
    id: number;
    name: string;
    description?: string;
    image: string;
    viewCount: number;
    likeCount: number;
    owner?: ProjectOwner;
}

interface TrendingProjectsData {
    nodes?: RawProject[];
    pageInfo?: {
        hasNextPage?: boolean;
        endCursor?: string | null;
    };
}

/**
 * Helper function to format project data
 * @param {Object} project - Raw project data from API
 * @returns {Object} Formatted project data
 */
const formatProjectData = (project: RawProject): FormattedProject => ({
    id: project.id,
    name: project.name,
    description: project.description,
    image: getProjectImageUrl(project.imageUrl, project.id, 60),
    viewCount: project.views?.length || 0,
    likeCount: project.likes?.length || 0,
    owner: project.owner
});

/**
 * Custom hook for fetching trending projects with pagination support
 * Uses useQuery for unified loading/error state management
 * @param {number} pageSize - Number of projects to fetch per page (default: 5)
 * @returns {Object} - { projects, loading, error, hasMore, loadMore, refresh }
 */
export const useTrendingProjects = (pageSize: number = 5) => {
    const [hasMore, setHasMore] = useState(false);
    const [endCursor, setEndCursor] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { executeQuery } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();
    const executeQueryRef = useRef(executeQuery);
    
    useEffect(() => {
        executeQueryRef.current = executeQuery;
    });

    const { data: projects, loading, error, refetch, setData: setProjects } = useQuery<FormattedProject[]>(
        GRAPHQL_QUERIES.GET_TRENDING_PROJECTS,
        { first: pageSize, after: null },
        {
            skip: authLoading || !isAuthenticated,
            autoFetch: true,
            initialData: [],
            transform: (data: unknown): FormattedProject[] => {
                const typedData = data as { project?: { trendingprojects?: TrendingProjectsData } } | null;
                const trendingData = typedData?.project?.trendingprojects;
                if (trendingData) {
                    setHasMore(trendingData.pageInfo?.hasNextPage || false);
                    setEndCursor(trendingData.pageInfo?.endCursor || null);
                }
                const fetchedProjects = trendingData?.nodes || [];
                return fetchedProjects.map(formatProjectData);
            }
        }
    );

    const loadMore = useCallback(async (): Promise<void> => {
        if (!hasMore || isLoadingMore || !endCursor || !isAuthenticated) return;
        
        setIsLoadingMore(true);
        try {
            const data = await executeQueryRef.current(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS, {
                first: pageSize,
                after: endCursor
            }) as { project?: { trendingprojects?: TrendingProjectsData } } | null;

            const trendingData = data?.project?.trendingprojects;
            const fetchedProjects = trendingData?.nodes || [];
            const formattedProjects = fetchedProjects.map(formatProjectData);

            setProjects((prev) => [...(prev || []), ...formattedProjects]);
            setHasMore(trendingData?.pageInfo?.hasNextPage || false);
            setEndCursor(trendingData?.pageInfo?.endCursor || null);
        } catch (err) {
            console.error("Failed to load more projects:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, endCursor, isAuthenticated, pageSize, setProjects]);

    const refresh = useCallback((): void => {
        setEndCursor(null);
        setHasMore(false);
        refetch();
    }, [refetch]);

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
