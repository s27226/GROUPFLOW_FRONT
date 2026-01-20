import { useState, useCallback } from "react";
import { GRAPHQL_QUERIES } from "../../queries/graphql";
import { useQuery } from "../core/useGraphQL";
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
    totalPostLikes?: number;
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
    likeCount: project.totalPostLikes || 0,
    owner: project.owner
});

/**
 * Custom hook for fetching trending projects
 * Uses useQuery for unified loading/error state management
 * @param {number} pageSize - Number of projects to display (default: 5)
 * @returns {Object} - { projects, loading, error, hasMore, loadMore, refresh }
 */
export const useTrendingProjects = (pageSize: number = 5) => {
    const [displayCount, setDisplayCount] = useState(pageSize);
    const { isAuthenticated, authLoading } = useAuth();

    const { data: allProjects, loading, error, refetch } = useQuery<FormattedProject[]>(
        GRAPHQL_QUERIES.GET_TRENDING_PROJECTS,
        {},
        {
            skip: authLoading || !isAuthenticated,
            autoFetch: true,
            initialData: [],
            transform: (data: unknown): FormattedProject[] => {
                const typedData = data as { project?: { trendingprojects?: RawProject[] } } | null;
                const fetchedProjects = typedData?.project?.trendingprojects || [];
                return fetchedProjects.map(formatProjectData);
            }
        }
    );

    // Slice projects based on displayCount for "load more" behavior
    const projects = allProjects?.slice(0, displayCount) || [];
    const hasMore = (allProjects?.length || 0) > displayCount;

    const loadMore = useCallback((): void => {
        if (hasMore) {
            setDisplayCount(prev => prev + pageSize);
        }
    }, [hasMore, pageSize]);

    const refresh = useCallback((): void => {
        setDisplayCount(pageSize);
        refetch();
    }, [refetch, pageSize]);

    return {
        projects,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        isLoadingMore: false
    };
};
