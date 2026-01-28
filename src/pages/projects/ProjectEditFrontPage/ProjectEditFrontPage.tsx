import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Sidebar } from "../../../components/layout";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { ImageUploadButton } from "../../../components/profile";
import styles from "./ProjectEditFrontPage.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery, useBlobUpload, useMutation } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { translateError } from "../../../utils/errorTranslation";

interface ProjectOwner {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface ProjectData {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    bannerUrl?: string;
    isPublic?: boolean;
    owner: ProjectOwner;
}

interface GraphQLProjectResponse {
    project?: {
        projectbyid?: ProjectData | ProjectData[];
    };
}

interface ImageSelectData {
    file: File;
    preview: string | ArrayBuffer | null;
}

export default function ProjectEditPage() {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { uploadBlob, uploading: blobUploading } = useBlobUpload();
    const { showToast } = useToast();

    const [error, setError] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [bannerUrl, setBannerUrl] = useState("");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [isPublic, setIsPublic] = useState(true);

    const { data: projectData, loading } = useQuery<ProjectData | null>(
        GRAPHQL_QUERIES.GET_PROJECT_BY_ID,
        { id: parseInt(projectId ?? "0") },
        {
            skip: !projectId,
            transform: (data: unknown): ProjectData | null => {
                const typedData = data as GraphQLProjectResponse | null;
                const projectArray = typedData?.project?.projectbyid;
                return Array.isArray(projectArray) ? projectArray[0] : projectArray ?? null;
            },
            onError: (err: Error) => setError(translateError(err.message, 'projects.loadProjectFailed'))
        }
    );

    const { execute: executeMutation } = useMutationQuery({
        onError: (err) => setError(translateError(err.message, 'common.errorOccurred'))
    });

    const { execute: saveProject, loading: saving } = useMutation();
    const { execute: deleteProject, loading: deleting } = useMutation();

    // Update form fields when project data loads
    useEffect(() => {
        if (!projectId) {
            setError(t('projects.noProjectId'));
            return;
        }

        if (projectData) {
            // Check if current user is the owner
            if (!authUser || String(projectData.owner.id) !== String(authUser.id)) {
                setError(t('projects.noPermissionEdit'));
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
            setError(t('projects.projectNotFound'));
        }
    }, [projectData, projectId, authUser, loading, t]);

    const handleImageSelect = ({ file, preview }: ImageSelectData) => {
        setImageFile(file);
        setImageUrl(typeof preview === 'string' ? preview : '');
    };

    const handleImageRemove = () => {
        setImageFile(null);
        setImageUrl("");
    };

    const handleBannerSelect = ({ file, preview }: ImageSelectData) => {
        setBannerFile(file);
        setBannerUrl(typeof preview === 'string' ? preview : '');
    };

    const handleBannerRemove = () => {
        setBannerFile(null);
        setBannerUrl("");
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError(t('projects.projectNameIsRequired'));
            return;
        }

        if (!description.trim()) {
            setError(t('projects.projectDescriptionIsRequired'));
            return;
        }

        await saveProject(async () => {
            setError(null);
            const parsedProjectId = parseInt(projectId ?? "0");

            // Upload logo to S3 if a new file was selected
            if (imageFile) {
                const blobData = await uploadBlob(imageFile, 'project', parsedProjectId);
                if (blobData) {
                    await executeMutation(GRAPHQL_MUTATIONS.UPDATE_PROJECT_IMAGE, {
                        input: { 
                            projectId: parsedProjectId, 
                            imageBlobId: blobData.id 
                        }
                    });
                    showToast(t('projects.projectLogoUploaded'), "success");
                }
            }

            // Upload banner to S3 if a new file was selected
            if (bannerFile) {
                const blobData = await uploadBlob(bannerFile, 'project', parsedProjectId);
                if (blobData) {
                    await executeMutation(GRAPHQL_MUTATIONS.UPDATE_PROJECT_BANNER, {
                        input: { 
                            projectId: parsedProjectId, 
                            bannerBlobId: blobData.id 
                        }
                    });
                    showToast(t('projects.projectBannerUploaded'), "success");
                }
            }

            const input = {
                id: parsedProjectId,
                name: name.trim(),
                description: description.trim(),
                imageUrl: imageUrl || null,
                isPublic: isPublic
            };

            await executeMutation(GRAPHQL_MUTATIONS.UPDATE_PROJECT, { input });

            showToast(t('projects.projectUpdated'), "success");
            navigate(`/project/${projectId}`);
        }).catch((err: Error) => {
            if (err.message?.includes("permission") || err.message?.includes("not authenticated")) {
                setError(t('projects.noPermissionEdit'));
            } else {
                setError(translateError(err.message, 'projects.saveChangesFailed'));
            }
        });
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(false);

        await deleteProject(async () => {
            setError(null);
            await executeMutation(GRAPHQL_MUTATIONS.DELETE_PROJECT, { 
                id: parseInt(projectId ?? "0") 
            });
            navigate("/myprojects");
        }).catch((err: Error) => {
            if (err.message?.includes("permission") || err.message?.includes("not authenticated")) {
                setError(t('projects.noPermissionDelete'));
            } else {
                setError(translateError(err.message, 'projects.deleteProjectFailed'));
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
                        <p>{t('projects.loadingProjectData')}</p>
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
                                {t('projects.accessDenied')}
                            </h2>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                                {error}
                            </p>
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => navigate(`/project/${projectId}`)}
                                >
                                    {t('projects.viewProject')}
                                </button>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => navigate(-1)}
                                    style={{
                                        backgroundColor: "var(--bg-secondary)",
                                        color: "var(--text-primary)"
                                    }}
                                >
                                    {t('projects.goBack')}
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
                    <h2>{t('projects.editProjectFrontpage')}</h2>

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
                            label={t('projects.projectLogo')}
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
                            label={t('projects.projectBanner')}
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
                        <label>{t('projects.projectNameRequired')}</label>
                        <input
                            className={styles.nameInput}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('projects.enterProjectName')}
                            required
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>{t('projects.descriptionRequired')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('projects.descriptionPlaceholder')}
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
                            {t('projects.makePublic')}
                        </label>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "var(--text-secondary)",
                                marginTop: "0.5rem"
                            }}
                        >
                            {t('projects.publicDescription')}
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
                            {saving || blobUploading ? t('projects.savingChanges') : t('projects.saveChanges')}
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
                            {t('common.cancel')}
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
                            {deleting ? t('projects.deletingProject') : t('projects.deleteProject')}
                        </button>
                    </div>

                    <ConfirmDialog
                        isOpen={showDeleteConfirm}
                        onConfirm={handleDelete}
                        onCancel={() => setShowDeleteConfirm(false)}
                        title={t('projects.deleteProject')}
                        message={t('projects.deleteProjectConfirm', { name })}
                        confirmText={t('common.delete')}
                        cancelText={t('common.cancel')}
                        danger={true}
                    />
                </div>
            </div>
        </div>
    );
}
