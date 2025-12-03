import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import { ArrowLeft } from "lucide-react";
import "../styles/PostPage.css";

export default function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    // dana testowe narazie
    const [post] = useState({
        id: postId,
        author: "Alice",
        time: "2h ago",
        content: "This is the full post content. It can be much longer and contain more details than what's shown in the feed preview. This page is dedicated to viewing a single post with all its comments.",
        image: "https://picsum.photos/800/400?random=1",
        comments: [
            {
                user: "Bob",
                time: "1h ago",
                text: "Great post!",
                likes: 3,
                liked: false,
                menuOpen: false,
                replies: [
                    {
                        user: "Charlie",
                        time: "45m ago",
                        text: "I agree!",
                        likes: 1,
                        liked: false,
                        menuOpen: false,
                        replies: []
                    }
                ]
            },
            {
                user: "Dave",
                time: "30m ago",
                text: "Thanks for sharing this",
                likes: 5,
                liked: false,
                menuOpen: false,
                replies: []
            }
        ]
    });

    return (
        <div className="maincomp-layout">
            <Navbar />
            <div className="maincomp-content">
                <Sidebar />
                <div className="maincomp-center-wrapper">
                    <div className="postpage-wrapper">
                        <button className="postpage-back-btn" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                            <span>Back</span>
                        </button>

                        <div className="postpage-card">
                            <Post 
                                {...post}
                                isFullView={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
