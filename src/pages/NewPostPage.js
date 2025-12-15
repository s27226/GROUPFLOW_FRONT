import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Image, X } from "lucide-react";
import "../styles/NewPostPage.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function NewPostPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [sharedPost, setSharedPost] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const shareData = params.get('share');
        if (shareData) {
            try {
                const post = JSON.parse(decodeURIComponent(shareData));
                setSharedPost(post);
            } catch (e) {
                console.error('Failed to parse shared post:', e);
            }
        }
    }, [location]);

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
            alert("Please write something for your post");
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

                                {sharedPost && (
                                    <div className="newpost-shared-preview">
                                        <div className="newpost-shared-header">
                                            <span>Sharing post from {sharedPost.author}</span>
                                        </div>
                                        <div className="newpost-shared-content">
                                            <div className="newpost-shared-info">
                                                <img
                                                    src={`https://api.dicebear.com/9.x/identicon/svg?seed=${sharedPost.author}`}
                                                    alt={sharedPost.author}
                                                    className="newpost-shared-avatar"
                                                />
                                                <div>
                                                    <strong>{sharedPost.author}</strong>
                                                    <span> · {sharedPost.time}</span>
                                                </div>
                                            </div>
                                            <p className="newpost-shared-text">{sharedPost.content}</p>
                                            {sharedPost.image && (
                                                <img src={sharedPost.image} alt="shared" className="newpost-shared-image" />
                                            )}
                                            <a 
                                                href={`/post/${sharedPost.id}`}
                                                className="newpost-shared-link"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/post/${sharedPost.id}`);
                                                }}
                                            >
                                                View original post
                                            </a>
                                        </div>
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
