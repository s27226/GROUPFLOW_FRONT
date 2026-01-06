import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Image, X } from "lucide-react";
import { useToast } from "../context/ToastContext";
import "../styles/NewPostPage.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuthenticatedRequest } from "../hooks/useAuthenticatedRequest";
import { useMyProjects } from "../hooks/useProjects";
import { GRAPHQL_MUTATIONS } from "../queries/graphql";

export default function NewPostPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useParams();
    const { showToast } = useToast();
    const { makeRequest } = useAuthenticatedRequest();
    
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [sharedPost, setSharedPost] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(projectId || null);
    const [loading, setLoading] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    // Use unified hook for projects
    const { projects: myProjects } = useMyProjects({ autoFetch: true });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const shareData = params.get("share");
        if (shareData) {
            try {
                const post = JSON.parse(decodeURIComponent(shareData));
                setSharedPost(post);
            } catch (e) {
                console.error("Failed to parse shared post:", e);
            }
        }
    }, [location]);

    useEffect(() => {
        // If we have a projectId from the route, set it as selected
        if (projectId) {
            setSelectedProjectId(parseInt(projectId));
        }
    }, [projectId]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            showToast("Please write something for your post", "warning");
            return;
        }

        if (!selectedProjectId) {
            showToast("Please select a project for your post", "warning");
            return;
        }

        setLoading(true);

        try {
            const input = {
                title: title.trim() || "Post",
                content: content.trim(),
                description: "",
                imageUrl: imagePreview || null,
                projectId: selectedProjectId ? parseInt(selectedProjectId) : null,
                sharedPostId: sharedPost?.id || null,
                isPublic: isPublic
            };

            const response = await makeRequest(GRAPHQL_MUTATIONS.CREATE_POST, { input });

            if (response?.data?.post?.createPost) {
                showToast("Post created successfully!", "success");
                
                // Navigate to the project profile page if posted to a project
                if (selectedProjectId) {
                    navigate(`/project/${selectedProjectId}`);
                } else {
                    navigate("/");
                }
            } else {
                console.error("Failed to create post:", response);
                showToast("Failed to create post", "error");
            }
        } catch (error) {
            console.error("Error creating post:", error);
            showToast("Failed to create post", "error");
        } finally {
            setLoading(false);
        }
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
                                <button className="newpost-close-btn" onClick={() => navigate("/")}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="newpost-form">
                                <div className="newpost-project-selector">
                                    <label htmlFor="project-select">Post to Project:</label>
                                    <select
                                        id="project-select"
                                        value={selectedProjectId || ""}
                                        onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="newpost-project-select"
                                    >
                                        <option value="">Select a project...</option>
                                        {myProjects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="newpost-title-wrapper">
                                    <input
                                        type="text"
                                        className="newpost-title-input"
                                        placeholder="Post title (optional)"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="newpost-textarea-wrapper">
                                    <textarea
                                        className="newpost-textarea"
                                        placeholder="What's on your mind?"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={8}
                                        maxLength={1000}
                                    />
                                    <div className="newpost-char-count">{content.length}/1000</div>
                                </div>

                                <div className="newpost-visibility-toggle">
                                    <label className="newpost-toggle-label">
                                        <span className="newpost-toggle-text">
                                            {isPublic ? "Public (Anyone can see)" : "Private (Only project members)"}
                                        </span>
                                        <div className="newpost-toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={isPublic}
                                                onChange={(e) => setIsPublic(e.target.checked)}
                                                className="newpost-toggle-input"
                                            />
                                            <span className="newpost-toggle-slider"></span>
                                        </div>
                                    </label>
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
                                                    src={sharedPost.authorProfilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${sharedPost.author}`}
                                                    alt={sharedPost.author}
                                                    className="newpost-shared-avatar"
                                                />
                                                <div>
                                                    <strong>{sharedPost.author}</strong>
                                                    <span> · {sharedPost.time}</span>
                                                </div>
                                            </div>
                                            <p className="newpost-shared-text">
                                                {sharedPost.content}
                                            </p>
                                            {sharedPost.image && (
                                                <img
                                                    src={sharedPost.image}
                                                    alt="shared"
                                                    className="newpost-shared-image"
                                                />
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
                                            disabled={!content.trim() || !selectedProjectId || loading}
                                        >
                                            {loading ? "Posting..." : "Post"}
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
