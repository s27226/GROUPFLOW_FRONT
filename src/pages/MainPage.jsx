import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import Trending from "../components/Trending";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../config/api";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import "../styles/MainPage.css";

export default function MainPage() {
    const [trendingProjects, setTrendingProjects] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(true);

    useEffect(() => {
        const fetchTrendingProjects = async () => {
            try {
                const res = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_TRENDING_PROJECTS,
                        variables: { first: 5 },
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (res.data.errors) {
                    throw new Error(res.data.errors[0].message);
                }

                const projects = res.data.data.project.trendingprojects.nodes || [];
                setTrendingProjects(projects.map(project => ({
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    image: project.imageUrl || `https://picsum.photos/60?random=${project.id}`,
                    viewCount: project.viewCount,
                    likeCount: project.likeCount,
                    owner: project.owner
                })));
                
                setLoadingTrending(false);
            } catch (err) {
                console.error("Failed to fetch trending projects:", err);
                setLoadingTrending(false);
                // Fallback to empty array on error
                setTrendingProjects([]);
            }
        };

        fetchTrendingProjects();
    }, []);

    return (
        <div className="main-layout">
            <Navbar />
            <div className="main-content">
                <Sidebar />
                <div className="feed-trending-wrapper">
                    <div className="feed-wrapper">
                        <Feed />
                    </div>
                    <Trending 
                        projects={trendingProjects} 
                        loading={loadingTrending}
                    />
                </div>
            </div>
        </div>
    );
}
