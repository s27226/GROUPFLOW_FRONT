import { useState, useEffect, useCallback } from "react";
import { useGraphQL, useQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../queries/graphql";

interface ProjectUser {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface Project {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    owner?: ProjectUser;
    members?: ProjectMember[];
}

interface ProjectMember {
    id: number;
    userId: number;
    user: ProjectUser;
    role?: string;
}

interface ProjectInvitation {
    id: number;
    project: Project;
    inviting: ProjectUser;
    name: string;
    description?: string;
    invitedBy: string;
}

interface UseProjectsOptions {
    autoFetch?: boolean;
}

/**
 * Custom hook for fetching user's projects
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch projects automatically on mount (default: true)
 * @returns {Object} { projects, loading, error, refetch }
 */
export const useMyProjects = (options: UseProjectsOptions = {}) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery<Project[]>(
        GRAPHQL_QUERIES.GET_MY_PROJECTS,
        {},
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data: unknown): Project[] => {
                const typedData = data as { project?: { myprojects?: Project[] } } | null;
                return typedData?.project?.myprojects || [];
            }
        }
    );

    return {
        projects: data,
        loading,
        error,
        refetch
    };
};

/**
 * Custom hook for fetching projects for a specific user
 * Uses useQuery for unified loading/error state management
 * @param {number} userId - User ID to fetch projects for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch projects automatically on mount (default: true)
 * @returns {Object} { projects, loading, error, refetch }
 */
export const useUserProjects = (userId: number, options: UseProjectsOptions = {}) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery<Project[]>(
        GRAPHQL_QUERIES.GET_USER_PROJECTS,
        { userId },
        {
            skip: authLoading || !isAuthenticated || !userId || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data: unknown): Project[] => {
                const typedData = data as { project?: { userprojects?: Project[] } } | null;
                return typedData?.project?.userprojects || [];
            }
        }
    );

    return {
        projects: data,
        loading,
        error,
        refetch
    };
};

/**
 * Custom hook for fetching a single project by ID
 * Uses useQuery for unified loading/error state management
 * @param {number} projectId - Project ID to fetch
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch project automatically on mount (default: true)
 * @returns {Object} { project, loading, error, refetch }
 */
export const useProject = (projectId: number | string, options: UseProjectsOptions = {}) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery<Project | null>(
        GRAPHQL_QUERIES.GET_PROJECT_BY_ID,
        { projectId: parseInt(String(projectId)) },
        {
            skip: authLoading || !isAuthenticated || !projectId || !autoFetch,
            autoFetch: autoFetch,
            initialData: null,
            transform: (data: unknown): Project | null => {
                const typedData = data as { project?: { projectbyid?: Project } } | null;
                return typedData?.project?.projectbyid || null;
            }
        }
    );

    return {
        project: data,
        loading,
        error,
        refetch
    };
};

/**
 * Custom hook for project invitations
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch invitations automatically on mount (default: true)
 * @returns {Object} { invitations, loading, error, refetch, acceptInvitation, rejectInvitation }
 */
export const useProjectInvitations = (options: UseProjectsOptions = {}) => {
    const { autoFetch = true } = options;
    const { executeMutation } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();

    const { data: invitations, loading, error, refetch, setData: setInvitations } = useQuery<ProjectInvitation[]>(
        GRAPHQL_QUERIES.GET_GROUP_INVITATIONS,
        { first: 50 },
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data: unknown): ProjectInvitation[] => {
                interface RawInvitation {
                    id: number;
                    project: Project;
                    inviting: ProjectUser;
                }
                const typedData = data as { projectInvitation?: { allprojectinvitations?: { nodes?: RawInvitation[] } } } | null;
                const invitationsData = typedData?.projectInvitation?.allprojectinvitations?.nodes || [];
                return invitationsData.map((inv): ProjectInvitation => ({
                    id: inv.id,
                    project: inv.project,
                    inviting: inv.inviting,
                    name: inv.project.name,
                    description: inv.project.description,
                    invitedBy: `${inv.inviting.name || ''} ${inv.inviting.surname || ''}`.trim()
                }));
            }
        }
    );

    const acceptInvitation = useCallback(
        async (invitationId: number): Promise<boolean> => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.ACCEPT_PROJECT_INVITATION, {
                    invitationId
                });
                // Remove from local state
                setInvitations((prev) => (prev || []).filter((inv: ProjectInvitation) => inv.id !== invitationId));
                return true;
            } catch (err) {
                console.error("Failed to accept project invitation:", err);
                throw err;
            }
        },
        [executeMutation, setInvitations]
    );

    const rejectInvitation = useCallback(
        async (invitationId: number): Promise<boolean> => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.REJECT_PROJECT_INVITATION, {
                    invitationId
                });
                // Remove from local state
                setInvitations((prev) => (prev || []).filter((inv: ProjectInvitation) => inv.id !== invitationId));
                return true;
            } catch (err) {
                console.error("Failed to reject project invitation:", err);
                throw err;
            }
        },
        [executeMutation, setInvitations]
    );

    return {
        invitations,
        loading,
        error,
        refetch,
        acceptInvitation,
        rejectInvitation,
        count: invitations?.length ?? 0
    };
};
