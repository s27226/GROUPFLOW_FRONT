import { useState, useEffect, useMemo } from "react";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import LoadingSpinner from "../../ui/LoadingSpinner";
import styles from "./Groups.module.css";
import Group from "../Group";
import { useSearchQuery, useQuery } from "../../../hooks";

export default function Groups({ projects }) {
    const searchQuery = useSearchQuery();

    const { data: allProjects, loading, error } = useQuery(
        GRAPHQL_QUERIES.GET_ALL_PROJECTS,
        { first: 50 },
        {
            autoFetch: true,
            initialData: [],
            transform: (data) => {
                const projectsData = data?.project?.allprojects?.nodes || [];
                return projectsData.map((project) => ({
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    imageUrl: project.imageUrl,
                    viewCount: project.viewCount,
                    likeCount: project.likeCount,
                    created: project.created,
                    owner: project.owner
                }));
            }
        }
    );

    // Filter based on search query using useMemo for performance
    const groups = useMemo(() => {
        if (!searchQuery) return allProjects;
        return allProjects.filter(
            (group) =>
                group?.name?.toLowerCase().includes(searchQuery) ||
                group?.description?.toLowerCase().includes(searchQuery)
        );
    }, [allProjects, searchQuery]);

    if (loading) {
        return (
            <div className={styles.groupsContainer}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={styles.groupsContainer}>
            {groups.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                groups.map((post, index) => <Group key={post.id || index} {...post} />)
            )}
        </div>
    );
}
