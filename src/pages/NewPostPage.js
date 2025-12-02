import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Image, X } from "lucide-react";
import "../styles/NewPostPage.css";
import { useNavigate } from "react-router-dom";

export default function NewPostPage() {
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!content.trim()) {
            alert("Please write something for your post!");
            return;
        }

        // TODO: Send to backend
        const newPost = {
            content,
            image: imagePreview,
            timestamp: new Date().toISOString(),
        };

        console.log("New post:", newPost);
        alert("Post created successfully!");
        
        // Navigate back to main page
        navigate("/");
    };

    return (
        <div className="maincomp-layout">
            <Navbar />
            <div className="maincomp-content">
                <Sidebar />
                <div className="maincomp-center-wrapper">
                    <div className="maincomp-feed-wrapper">
                        <div className="newpost-container">
                            <div className="newpost-header">
                                <h2>Create New Post</h2>
                                <button 
                                    className="newpost-close-btn"
                                    onClick={() => navigate("/")}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="newpost-form">
                                <div className="newpost-textarea-wrapper">
                                    <textarea
                                        className="newpost-textarea"
                                        placeholder="What's on your mind?"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={8}
                                        maxLength={1000}
                                    />
                                    <div className="newpost-char-count">
                                        {content.length}/1000
                                    </div>
                                </div>

                                {imagePreview && (
                                    <div className="newpost-image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="newpost-remove-image"
                                            onClick={handleRemoveImage}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}

                                <div className="newpost-actions">
                                    <div className="newpost-toolbar">
                                        <label htmlFor="image-upload" className="newpost-image-btn">
                                            <Image size={20} />
                                            <span>Add Image</span>
                                        </label>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: "none" }}
                                        />
                                    </div>

                                    <div className="newpost-submit-group">
                                        <button
                                            type="button"
                                            className="newpost-cancel-btn"
                                            onClick={() => navigate("/")}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="newpost-submit-btn"
                                            disabled={!content.trim()}
                                        >
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
