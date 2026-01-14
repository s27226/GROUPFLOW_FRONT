import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "../../../components/layout";
import { Image, X } from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import styles from "./NewPostPage.module.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useMutationQuery, useMyProjects } from "../../../hooks";
import { GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { getProfilePicUrl } from "../../../utils/profilePicture";

interface SharedPost {
    id: number;
    author: string;
    authorProfilePic?: string;
    content: string;
    image?: string;
    time: string;
}

interface CreatePostResponse {
    post?: {
        createPost?: {
            id: number;
        };
    };
}

export default function NewPostPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useParams<{ projectId: string }>();
    const { showToast } = useToast();
    
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [sharedPost, setSharedPost] = useState<SharedPost | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projectId ? parseInt(projectId) : null);
    const [isPublic, setIsPublic] = useState(true);

    // Use unified hooks
    const { projects: myProjects } = useMyProjects({ autoFetch: true });
    const { execute: createPost, loading } = useMutationQuery<CreatePostResponse>({
        onSuccess: () => {
            showToast(t('feed.postCreated'), "success");
            if (selectedProjectId) {
                navigate(`/project/${selectedProjectId}`);
            } else {
                navigate("/");
            }
        },
        onError: () => showToast(t('feed.postCreateFailed'), "error")
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const shareData = params.get("share");
        if (shareData) {
            try {
                const post = JSON.parse(decodeURIComponent(shareData)) as SharedPost;
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!content.trim()) {
            showToast(t('feed.pleaseWriteSomething'), "warning");
            return;
        }

        if (!selectedProjectId) {
            showToast(t('feed.pleaseSelectProject'), "warning");
            return;
        }

        const input = {
            title: title.trim() || "Post",
            content: content.trim(),
            description: "",
            imageUrl: imagePreview || null,
            projectId: selectedProjectId,
            sharedPostId: sharedPost?.id ? parseInt(String(sharedPost.id), 10) : null,
            isPublic: isPublic
        };

        const response = await createPost(GRAPHQL_MUTATIONS.CREATE_POST, { input });

        // Response is already unwrapped by useMutationQuery - onSuccess/onError handles navigation/toast
        if (!response?.post?.createPost) {
            console.error("Failed to create post:", response);
        }
    };

    return (
        <Layout variant="compact" showTrending={false}>
            <div className={styles.newpostContainer}>
                <div className={styles.newpostHeader}>
                    <h2>{t('feed.createNewPost')}</h2>
                    <button className={styles.newpostCloseBtn} onClick={() => navigate("/")}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.newpostForm}>
                    <div className={styles.newpostProjectSelector}>
                        <label htmlFor="project-select">{t('feed.postToProject')}</label>
                        <select
                            id="project-select"
                            value={selectedProjectId ?? ""}
                            onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : null)}
                            className={styles.newpostProjectSelect}
                        >
                            <option value="">{t('feed.selectProject')}</option>
                            {(myProjects || []).map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.newpostTitleWrapper}>
                        <input
                            type="text"
                            className={styles.newpostTitleInput}
                            placeholder={t('feed.postTitleOptional')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.newpostTextareaWrapper}>
                        <textarea
                            className={styles.newpostTextarea}
                            placeholder={t('feed.whatsOnYourMind')}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            maxLength={1000}
                        />
                        <div className={styles.newpostCharCount}>{content.length}/1000</div>
                    </div>

                    <div className={styles.newpostVisibilityToggle}>
                        <label className={styles.newpostToggleLabel}>
                            <span className={styles.newpostToggleText}>
                                {isPublic ? t('feed.publicPost') : t('feed.privatePost')}
                            </span>
                            <div className={styles.newpostToggleSwitch}>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className={styles.newpostToggleInput}
                                />
                                <span className={styles.newpostToggleSlider}></span>
                            </div>
                        </label>
                    </div>

                    {imagePreview && (
                        <div className={styles.newpostImagePreview}>
                            <img src={imagePreview} alt="Preview" />
                            <button
                                type="button"
                                className={styles.newpostRemoveImage}
                                onClick={handleRemoveImage}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {sharedPost && (
                        <div className={styles.newpostSharedPreview}>
                            <div className={styles.newpostSharedHeader}>
                                <span>{t('feed.sharedPostFrom')} {sharedPost.author}</span>
                            </div>
                            <div className={styles.newpostSharedContent}>
                                <div className={styles.newpostSharedInfo}>
                                    <img
                                        src={sharedPost.authorProfilePic}
                                        alt={sharedPost.author}
                                        className={styles.newpostSharedAvatar}
                                    />
                                    <div>
                                        <strong>{sharedPost.author}</strong>
                                        <span> · {sharedPost.time}</span>
                                    </div>
                                </div>
                                <p className={styles.newpostSharedText}>
                                    {sharedPost.content}
                                </p>
                                {sharedPost.image && (
                                    <img
                                        src={sharedPost.image}
                                        alt="shared"
                                        className={styles.newpostSharedImage}
                                    />
                                )}
                                <a
                                    href={`/post/${sharedPost.id}`}
                                    className={styles.newpostSharedLink}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/post/${sharedPost.id}`);
                                    }}
                                >
                                    {t('feed.viewOriginal')}
                                </a>
                            </div>
                        </div>
                    )}

                    <div className={styles.newpostActions}>
                        <div className={styles.newpostToolbar}>
                            <label htmlFor="image-upload" className={styles.newpostImageBtn}>
                                <Image size={20} />
                                <span>{t('feed.addImage')}</span>
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: "none" }}
                            />
                        </div>

                        <div className={styles.newpostSubmitGroup}>
                            <button
                                type="button"
                                className={styles.newpostCancelBtn}
                                onClick={() => navigate("/")}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className={styles.newpostSubmitBtn}
                                disabled={!content.trim() || !selectedProjectId || loading}
                            >
                                {loading ? t('feed.posting') : t('feed.post')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
