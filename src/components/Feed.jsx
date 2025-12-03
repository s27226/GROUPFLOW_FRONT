import React, { useEffect, useState } from "react";
import Post from "./Post";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../config/api";
import { GRAPHQL_QUERIES } from "../queries/graphql";

const formatTime = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_POSTS,
                        variables: {},
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (res.data.errors) {
                    throw new Error(res.data.errors[0].message);
                }

                setPosts(res.data.data.post.allposts || []);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch posts:", err);
                setError("Failed to fetch posts");
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="feed-container">
            {posts?.length === 0 ? (
                <p>No posts available. Be the first to create one!</p>
            ) : (
                posts.map((post) => (
                    <Post
                        key={post.id}
                        author={post.user?.nickname || "Unknown"}
                        time={formatTime(post.created)}
                        content={post.content}
                        title={post.title}
                        image={post.imageUrl || null}
                    />
                ))
            )}
        </div>
    );
}
