import { useState, useEffect, useCallback } from "react";
import { useGraphQL } from "./useGraphQL";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";

/**
 * Custom hook for fetching user's projects
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch projects automatically on mount (default: true)
 * @param {number} options.userId - Specific user ID to fetch projects for
 * @returns {Object} { projects, loading, error, refetch }
 */
export const useMyProjects = (options = {}) => {
    const { autoFetch = true } = options;
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_PROJECTS, {});
            const projectsData = data?.project?.myprojects || [];
            setProjects(projectsData);
            return projectsData;
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            setError(err);
            setProjects([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery]);

    useEffect(() => {
        if (autoFetch) {
            fetchProjects();
        }
    }, [autoFetch, fetchProjects]);

    return {
        projects,
        loading,
        error,
        refetch: fetchProjects
    };
};

/**
 * Custom hook for fetching projects for a specific user
 * @param {number} userId - User ID to fetch projects for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch projects automatically on mount (default: true)
 * @returns {Object} { projects, loading, error, refetch }
 */
export const useUserProjects = (userId, options = {}) => {
    const { autoFetch = true } = options;
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchProjects = useCallback(async () => {
        if (!userId) return [];
        
        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_USER_PROJECTS, { userId });
            const projectsData = data?.project?.userprojects || [];
            setProjects(projectsData);
            return projectsData;
        } catch (err) {
            console.error("Failed to fetch user projects:", err);
            setError(err);
            setProjects([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery, userId]);

    useEffect(() => {
        if (autoFetch && userId) {
            fetchProjects();
        }
    }, [autoFetch, userId, fetchProjects]);

    return {
        projects,
        loading,
        error,
        refetch: fetchProjects
    };
};

/**
 * Custom hook for fetching a single project by ID
 * @param {number} projectId - Project ID to fetch
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch project automatically on mount (default: true)
 * @returns {Object} { project, loading, error, refetch }
 */
export const useProject = (projectId, options = {}) => {
    const { autoFetch = true } = options;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();

    const fetchProject = useCallback(async () => {
        if (!projectId) return null;
        
        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT, { 
                projectId: parseInt(projectId) 
            });
            const projectData = data?.project?.projectbyid || null;
            setProject(projectData);
            return projectData;
        } catch (err) {
            console.error("Failed to fetch project:", err);
            setError(err);
            setProject(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [executeQuery, projectId]);

    useEffect(() => {
        if (autoFetch && projectId) {
            fetchProject();
        }
    }, [autoFetch, projectId, fetchProject]);

    return {
        project,
        loading,
        error,
        refetch: fetchProject
    };
};

/**
 * Custom hook for project invitations
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch invitations automatically on mount (default: true)
 * @returns {Object} { invitations, loading, error, refetch, acceptInvitation, rejectInvitation }
 */
export const useProjectInvitations = (options = {}) => {
    const { autoFetch = true } = options;
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery, executeMutation } = useGraphQL();

    const fetchInvitations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_GROUP_INVITATIONS, { first: 50 });
            const invitationsData = data?.projectInvitation?.allprojectinvitations?.nodes || [];
            
            const formatted = invitationsData.map((inv) => ({
                id: inv.id,
                project: inv.project,
                inviting: inv.inviting,
                name: inv.project.name,
                description: inv.project.description,
                invitedBy: `${inv.inviting.name} ${inv.inviting.surname}`
            }));
            
            setInvitations(formatted);
            return formatted;
        } catch (err) {
            console.error("Failed to fetch project invitations:", err);
            setError(err);
            setInvitations([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery]);

    useEffect(() => {
        if (autoFetch) {
            fetchInvitations();
        }
    }, [autoFetch, fetchInvitations]);

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
        [executeMutation]
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
        [executeMutation]
    );

    return {
        invitations,
        loading,
        error,
        refetch: fetchInvitations,
        acceptInvitation,
        rejectInvitation,
        count: invitations.length
    };
};
