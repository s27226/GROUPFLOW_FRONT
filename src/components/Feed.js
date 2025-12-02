import React, { useState } from "react";
import Post from "./Post";
import shrimp from "../images/shrimp.png"

export default function Feed() {
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: "Alice",
            time: "2h ago",
            content: "hardcoded some test posts for viewing purposes (im gonna make the shrimp the coconut.png of our site)",
            image: shrimp,
            saved: false,
            hidden: false,
        },
        {
            id: 2,
            author: "Bob",
            time: "5h ago",
            content: "THE FUCKING TOP POSTS IMAGE REFUSES TO STAY IN BOUNDS UNLESS I FORCE PUSH IT DOWN WITH MARGIN-TOP CAN IT NOT",
            image: null,
            saved: false,
            hidden: false,
        },
        {
            id: 3,
            author: "Charlie",
            time: "1d ago",
            content: "We could use this page to leave each other comments when doing one anothers branches",
            image: "https://picsum.photos/600/300?random=2",
            saved: false,
            hidden: false,
            comments: [{
                user: "Frank",
                time: "12h ago",
                text: "I feel this in my bones",
                likes: 3,
                liked: false,
                menuOpen: false,
                replies: [{
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }]
            },
                {
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }, {
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }
            ]
        },
        {
            id: 4,
            author: "John",
            time: "1d ago",
            content: "Man",
            saved: false,
            hidden: false,
            comments: [
                {
                    user: "Alice",
                    time: "5h ago",
                    text: "Women",
                    likes: 2,
                    liked: false,
                    menuOpen: false,
                    replies: [
                        {
                            user: "Bob",
                            time: "4h ago",
                            text: "Test",
                            likes: 1,
                            liked: false,
                            menuOpen: false,
                            replies: [
                                {
                                    user: "Charlie",
                                    time: "3h ago",
                                    text: "Fax machine noises",
                                    likes: 0,
                                    liked: false,
                                    menuOpen: false,
                                    replies: [
                                        {
                                            user: "Dave",
                                            time: "2h ago",
                                            text: "I must be the reason why, you have given up your smiles and the hope inside your eyes",
                                            likes: 0,
                                            liked: false,
                                            menuOpen: false,
                                            replies: [
                                                {
                                                    user: "Eve",
                                                    time: "1h ago",
                                                    text: "Reply at depth 5 please dont im begging",
                                                    likes: 0,
                                                    liked: false,
                                                    menuOpen: false,
                                                    replies: []
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }
            ]
        }
    ]);

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
        <div className="feed-container">
            {visiblePosts.map((post) => (
                <Post 
                    key={post.id} 
                    {...post}
                    onHide={handleHidePost}
                    onUndoHide={handleUndoHide}
                    onSave={handleSavePost}
                />
            ))}
        </div>

    );
}
