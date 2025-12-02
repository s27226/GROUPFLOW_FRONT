import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import Trending from "../components/Trending";
import "../styles/MainPage.css";
import shrimp from "../images/shrimp.png";

export default function SavedPage() {
    const trendingProjects = [
        {
            name: "Shrimp Tracker",
            description: "A small app to track your shrimp collection",
            image: shrimp,
        },
        {
            name: "Task Manager 2",
            description: "Some more hardcoded posts for designing stuff",
            image: "https://picsum.photos/60?random=2",
        },
        {
            name: "Defenestrator",
            description: "should replace those when we have proper project sites ready",
            image: "https://picsum.photos/60?random=3",
        },
    ];

    const [posts, setPosts] = useState([
        {
            id: 1,
            author: "Alice",
            time: "2h ago",
            content: "This is a saved post example",
            image: shrimp,
            saved: true,
            hidden: false,
            comments: []
        },
        {
            id: 2,
            author: "Bob",
            time: "5h ago",
            content: "Another saved post for testing",
            image: null,
            saved: true,
            hidden: false,
            comments: []
        },
        {
            id: 3,
            author: "Charlie",
            time: "1d ago",
            content: "Saved posts appear here",
            image: "https://picsum.photos/600/300?random=2",
            saved: true,
            hidden: false,
            comments: []
        },
    ]);

    const [undoTimeout, setUndoTimeout] = useState(null);

    const handleHidePost = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, hidden: true } : post
        ));
    };

    const handleUndoHide = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, hidden: false } : post
        ));
    };

    const handleSavePost = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, saved: !post.saved } : post
        ));
    };

    const visiblePosts = posts.filter(post => !post.hidden);

    return (
        <div className="mainpage-layout">
            <Navbar />
            <div className="mainpage-content">
                <Sidebar />
                <div className="mainpage-feed-trending-wrapper">
                    <div className="mainpage-feed-wrapper">
                        <div className="feed-container">
                            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', marginTop: '0' }}>Saved Posts</h2>
                            {visiblePosts.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                                    No saved posts yet
                                </p>
                            ) : (
                                visiblePosts.map((post) => (
                                    <Post
                                        key={post.id}
                                        id={post.id}
                                        author={post.author}
                                        time={post.time}
                                        content={post.content}
                                        image={post.image}
                                        comments={post.comments}
                                        saved={post.saved}
                                        hidden={post.hidden}
                                        onHide={handleHidePost}
                                        onUndoHide={handleUndoHide}
                                        onSave={handleSavePost}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                    <Trending projects={trendingProjects} />
                </div>
            </div>
        </div>
    );
}
