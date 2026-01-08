import { useState, useEffect } from "react";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import LoadingSpinner from "../../ui/LoadingSpinner";
import "./Groups.css";
import Group from "../Group";
import { useSearchQuery } from "../../../hooks/useSearchQuery";
import { useGraphQL } from "../../../hooks/useGraphQL";

export default function Groups({ projects }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchQuery = useSearchQuery();
    const { executeQuery } = useGraphQL();

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_ALL_PROJECTS, {
                    first: 50
                });

                const projectsData = data.project.allprojects.nodes || [];
                const formattedProjects = projectsData.map((project) => ({
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    imageUrl: project.imageUrl,
                    viewCount: project.viewCount,
                    likeCount: project.likeCount,
                    created: project.created,
                    owner: project.owner
                }));

                // Filter based on search query
                if (searchQuery) {
                    const filtered = formattedProjects.filter(
                        (group) =>
                            group?.name?.toLowerCase().includes(searchQuery) ||
                            group?.description?.toLowerCase().includes(searchQuery)
                    );
                    setGroups(filtered);
                } else {
                    setGroups(formattedProjects);
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setGroups([]);
                setLoading(false);
            }
        };

        fetchProjects();
    }, [searchQuery, executeQuery]);

    if (loading) {
        return (
            <div className="groups-container">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="groups-container">
            {groups.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                groups.map((post, index) => <Group key={post.id || index} {...post} />)
            )}
        </div>
    );
}
