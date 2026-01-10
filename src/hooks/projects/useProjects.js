import { useState, useEffect, useCallback } from "react";
import { useGraphQL, useQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../queries/graphql";

/**
 * Custom hook for fetching user's projects
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch projects automatically on mount (default: true)
 * @returns {Object} { projects, loading, error, refetch }
 */
export const useMyProjects = (options = {}) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery(
        GRAPHQL_QUERIES.GET_MY_PROJECTS,
        {},
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data) => data?.project?.myprojects || []
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
export const useUserProjects = (userId, options = {}) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery(
        GRAPHQL_QUERIES.GET_USER_PROJECTS,
        { userId },
        {
            skip: authLoading || !isAuthenticated || !userId || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data) => data?.project?.userprojects || []
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
export const useProject = (projectId, options = {}) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();

    const { data, loading, error, refetch } = useQuery(
        GRAPHQL_QUERIES.GET_PROJECT,
        { projectId: parseInt(projectId) },
        {
            skip: authLoading || !isAuthenticated || !projectId || !autoFetch,
            autoFetch: autoFetch,
            initialData: null,
            transform: (data) => data?.project?.projectbyid || null
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
export const useProjectInvitations = (options = {}) => {
    const { autoFetch = true } = options;
    const { executeMutation } = useGraphQL();
    const { isAuthenticated, authLoading } = useAuth();

    const { data: invitations, loading, error, refetch, setData: setInvitations } = useQuery(
        GRAPHQL_QUERIES.GET_GROUP_INVITATIONS,
        { first: 50 },
        {
            skip: authLoading || !isAuthenticated || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data) => {
                const invitationsData = data?.projectInvitation?.allprojectinvitations?.nodes || [];
                return invitationsData.map((inv) => ({
                    id: inv.id,
                    project: inv.project,
                    inviting: inv.inviting,
                    name: inv.project.name,
                    description: inv.project.description,
                    invitedBy: `${inv.inviting.name} ${inv.inviting.surname}`
                }));
            }
        }
    );

    const acceptInvitation = useCallback(
        async (invitationId) => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.ACCEPT_PROJECT_INVITATION, {
                    invitationId
                });
                // Remove from local state
                setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
                return true;
            } catch (err) {
                console.error("Failed to accept project invitation:", err);
                throw err;
            }
        },
        [executeMutation, setInvitations]
    );

    const rejectInvitation = useCallback(
        async (invitationId) => {
            try {
                await executeMutation(GRAPHQL_MUTATIONS.REJECT_PROJECT_INVITATION, {
                    invitationId
                });
                // Remove from local state
                setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
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
        count: invitations.length
    };
};
