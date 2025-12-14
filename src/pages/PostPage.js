import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import SkeletonPost from "../components/ui/SkeletonPost";
import { ArrowLeft } from "lucide-react";
import { usePost } from "../hooks/usePosts";
import "../styles/PostPage.css";

export default function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { post, loading, error } = usePost(postId);

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
                            {loading ? (
                                <SkeletonPost count={1} />
                            ) : error ? (
                                <p className="error-message">{error}</p>
                            ) : (
                                <Post 
                                    {...post}
                                    isFullView={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
