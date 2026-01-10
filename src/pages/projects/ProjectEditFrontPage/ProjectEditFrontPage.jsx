import { useState, useEffect } from "react";
import { Navbar, Sidebar } from "../../../components/layout";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { ImageUploadButton } from "../../../components/profile";
import styles from "./ProjectEditFrontPage.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery, useBlobUpload, useMutation } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

export default function ProjectEditPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { uploadBlob, deleteBlob, uploading: blobUploading } = useBlobUpload();
    const { showToast } = useToast();

    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [bannerUrl, setBannerUrl] = useState("");
    const [bannerFile, setBannerFile] = useState(null);
    const [isPublic, setIsPublic] = useState(true);

    const { data: projectData, loading } = useQuery(
        GRAPHQL_QUERIES.GET_PROJECT_BY_ID,
        { id: parseInt(projectId) },
        {
            skip: !projectId,
            transform: (data) => {
                const projectArray = data.project?.projectbyid;
                return Array.isArray(projectArray) ? projectArray[0] : projectArray;
            },
            onError: () => setError("Failed to load project data")
        }
    );

    const { execute: executeMutation } = useMutationQuery({
        onError: (err) => setError(err.message || "An error occurred")
    });

    const { execute: saveProject, loading: saving } = useMutation();
    const { execute: deleteProject, loading: deleting } = useMutation();

    // Update form fields when project data loads
    useEffect(() => {
        if (!projectId) {
            setError("No project ID provided");
            return;
        }

        if (projectData) {
            // Check if current user is the owner
            if (!authUser || projectData.owner.id !== authUser.id) {
                setError("You don't have permission to edit this project");
                setIsOwner(false);
                return;
            }

            setIsOwner(true);
            setName(projectData.name || "");
            setDescription(projectData.description || "");
            setImageUrl(projectData.imageUrl || "");
            setBannerUrl(projectData.bannerUrl || "");
            setIsPublic(projectData.isPublic ?? true);
            setError(null);
        } else if (!loading && projectId) {
            setError("Project not found");
        }
    }, [projectData, projectId, authUser, loading]);

    const handleImageSelect = ({ file, preview }) => {
        setImageFile(file);
        setImageUrl(preview);
    };

    const handleImageRemove = () => {
        setImageFile(null);
        setImageUrl("");
    };

    const handleBannerSelect = ({ file, preview }) => {
        setBannerFile(file);
        setBannerUrl(preview);
    };

    const handleBannerRemove = () => {
        setBannerFile(null);
        setBannerUrl("");
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Project name is required");
            return;
        }

        if (!description.trim()) {
            setError("Project description is required");
            return;
        }

        await saveProject(async () => {
            setError(null);

            // Upload logo to S3 if a new file was selected
            if (imageFile) {
                const blobData = await uploadBlob(imageFile, "ProjectLogo", parseInt(projectId));
                await executeMutation(GRAPHQL_MUTATIONS.UPDATE_PROJECT_IMAGE, {
                    input: { 
                        projectId: parseInt(projectId), 
                        imageBlobId: blobData.id 
                    }
                });
                showToast("Project logo uploaded successfully", "success");
            }

            // Upload banner to S3 if a new file was selected
            if (bannerFile) {
                const blobData = await uploadBlob(bannerFile, "ProjectBanner", parseInt(projectId));
                await executeMutation(GRAPHQL_MUTATIONS.UPDATE_PROJECT_BANNER, {
                    input: { 
                        projectId: parseInt(projectId), 
                        bannerBlobId: blobData.id 
                    }
                });
                showToast("Project banner uploaded successfully", "success");
            }

            const input = {
                id: parseInt(projectId),
                name: name.trim(),
                description: description.trim(),
                imageUrl: imageUrl || null,
                isPublic: isPublic
            };

            await executeMutation(GRAPHQL_MUTATIONS.UPDATE_PROJECT, { input });

            showToast("Project updated successfully", "success");
            navigate(`/project/${projectId}`);
        }).catch(err => {
            if (err.message?.includes("permission") || err.message?.includes("not authenticated")) {
                setError(
                    "You don't have permission to edit this project. Only the project owner can make changes."
                );
            } else {
                setError(err.message || "Failed to save changes. Please try again.");
            }
        });
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(false);

        await deleteProject(async () => {
            setError(null);
            await executeMutation(GRAPHQL_MUTATIONS.DELETE_PROJECT, { 
                id: parseInt(projectId) 
            });
            navigate("/myprojects");
        }).catch(err => {
            if (err.message?.includes("permission") || err.message?.includes("not authenticated")) {
                setError(
                    "You don't have permission to delete this project. Only the project owner can delete it."
                );
            } else {
                setError(err.message || "Failed to delete project. Please try again.");
            }
        });
    };

    if (loading) {
        return (
            <div className={styles.editLayout}>
                <Navbar />
                <div className={styles.editContent}>
                    <Sidebar />
                    <div className={styles.editMain}>
                        <p>Loading project data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !isOwner) {
        return (
            <div className={styles.editLayout}>
                <Navbar />
                <div className={styles.editContent}>
                    <Sidebar />
                    <div className={styles.editMain}>
                        <div
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                backgroundColor: "var(--bg-card)",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)"
                            }}
                        >
                            <h2 style={{ color: "var(--error-color)", marginBottom: "1rem" }}>
                                Access Denied
                            </h2>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                                {error}
                            </p>
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => navigate(`/project/${projectId}`)}
                                >
                                    View Project
                                </button>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => navigate(-1)}
                                    style={{
                                        backgroundColor: "var(--bg-secondary)",
                                        color: "var(--text-primary)"
                                    }}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.editLayout}>
            <Navbar />
            <div className={styles.editContent}>
                <Sidebar />

                <div className={styles.editMain}>
                    <h2>Edit Project Frontpage</h2>

                    {error && (
                        <div
                            style={{
                                padding: "1rem",
                                marginBottom: "1rem",
                                backgroundColor: "var(--error-bg)",
                                color: "var(--error-color)",
                                borderRadius: "8px",
                                border: "1px solid var(--error-color)"
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div className={styles.optionSection}>
                        <ImageUploadButton
                            label="Project Logo *"
                            preview={imageUrl}
                            onImageSelect={handleImageSelect}
                            onImageRemove={handleImageRemove}
                            onUrlChange={setImageUrl}
                            urlValue={imageUrl}
                            type="project-logo"
                            showUrlInput={true}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <ImageUploadButton
                            label="Project Banner"
                            preview={bannerUrl}
                            onImageSelect={handleBannerSelect}
                            onImageRemove={handleBannerRemove}
                            onUrlChange={setBannerUrl}
                            urlValue={bannerUrl}
                            type="project-banner"
                            showUrlInput={true}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>Project Name *</label>
                        <input
                            className={styles.nameInput}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write a short description of your project..."
                            rows={5}
                            required
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                style={{ marginRight: "0.5rem" }}
                            />
                            Make project public
                        </label>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "var(--text-secondary)",
                                marginTop: "0.5rem"
                            }}
                        >
                            Public projects can be viewed by anyone. Private projects are only
                            visible to you and your collaborators.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                        <button
                            className={styles.editBtn}
                            onClick={handleSave}
                            disabled={saving || deleting || blobUploading || !name.trim() || !description.trim()}
                            style={{
                                opacity: saving || deleting || blobUploading || !name.trim() || !description.trim() ? 0.6 : 1,
                                cursor:
                                    saving || deleting || blobUploading || !name.trim() || !description.trim()
                                        ? "not-allowed"
                                        : "pointer"
                            }}
                        >
                            {saving || blobUploading ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            className={styles.editBtn}
                            onClick={() => navigate(`/project/${projectId}`)}
                            disabled={saving || deleting}
                            style={{
                                backgroundColor: "var(--bg-secondary)",
                                color: "var(--text-primary)"
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            className={styles.editBtn}
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={saving || deleting}
                            style={{
                                backgroundColor: "var(--error)",
                                color: "white",
                                marginLeft: "auto",
                                opacity: saving || deleting ? 0.6 : 1,
                                cursor: saving || deleting ? "not-allowed" : "pointer"
                            }}
                        >
                            {deleting ? "Deleting..." : "Delete Project"}
                        </button>
                    </div>

                    <ConfirmDialog
                        isOpen={showDeleteConfirm}
                        onConfirm={handleDelete}
                        onCancel={() => setShowDeleteConfirm(false)}
                        title="Delete Project"
                        message={`Are you sure you want to delete "${name}"? This action cannot be undone and will delete all project data, including chat history.`}
                        confirmText="Delete"
                        cancelText="Cancel"
                        danger={true}
                    />
                </div>
            </div>
        </div>
    );
}
