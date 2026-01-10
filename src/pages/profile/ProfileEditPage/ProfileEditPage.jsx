import { useState, useEffect } from "react";
import { Navbar, Sidebar } from "../../../components/layout";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { ImageUploadButton } from "../../../components/profile";
import styles from "./ProfileEditPage.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery, useBlobUpload, useMutation } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";

export default function ProfileEditPage() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { uploadBlob, deleteBlob, uploading: blobUploading } = useBlobUpload();
    const { showToast } = useToast();

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [banner, setBanner] = useState("");
    const [bannerFile, setBannerFile] = useState(null);
    const [pfp, setPfp] = useState("");
    const [pfpFile, setPfpFile] = useState(null);
    const [abt, setAbt] = useState("");

    const { data: user, loading } = useQuery(
        GRAPHQL_QUERIES.GET_CURRENT_USER,
        {},
        {
            transform: (data) => data?.users?.me || null,
            onError: () => console.error("Failed to fetch user")
        }
    );

    const { execute: executeMutation } = useMutationQuery({
        onError: (error) => showToast(error.message || "An error occurred", "error")
    });

    const { execute: saveProfile, loading: saving } = useMutation();

    // Update form fields when user data loads
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setBio(user.bio || "");
            setBanner(user.bannerPicUrl || user.bannerPic || "https://picsum.photos/900/200?random=10");
            setPfp(
                user.profilePicUrl || user.profilePic ||
                    `https://api.dicebear.com/9.x/identicon/svg?seed=${user.nickname}`
            );
            setAbt(user.about || "");
        }
    }, [user]);

    const handleProfileImageSelect = ({ file, preview }) => {
        setPfpFile(file);
        setPfp(preview);
    };

    const handleProfileImageRemove = async () => {
        // If user has a blob ID, delete the blob from S3
        if (user?.profilePicBlobId) {
            await deleteBlob(user.profilePicBlobId);
            await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_PROFILE_IMAGE, {
                input: { 
                    userId: user.id,
                    profilePicBlobId: null 
                }
            });
            showToast("Profile picture removed", "success");
        }
        setPfpFile(null);
        setPfp(`https://api.dicebear.com/9.x/identicon/svg?seed=${user?.nickname}`);
    };

    const handleBannerImageSelect = ({ file, preview }) => {
        setBannerFile(file);
        setBanner(preview);
    };

    const handleBannerImageRemove = async () => {
        // If user has a blob ID, delete the blob from S3
        if (user?.bannerPicBlobId) {
            await deleteBlob(user.bannerPicBlobId);
            await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_BANNER_IMAGE, {
                input: { 
                    userId: user.id,
                    bannerPicBlobId: null 
                }
            });
            showToast("Banner removed", "success");
        }
        setBannerFile(null);
        setBanner("https://picsum.photos/900/200?random=10");
    };

    const handleSave = async () => {
        await saveProfile(async () => {
            // Upload profile picture to S3 if a new file was selected
            if (pfpFile) {
                const blobData = await uploadBlob(pfpFile, "UserProfilePicture");
                await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_PROFILE_IMAGE, {
                    input: { 
                        userId: user.id,
                        profilePicBlobId: blobData.id 
                    }
                });
                showToast("Profile picture uploaded successfully", "success");
            }

            // Upload banner to S3 if a new file was selected
            if (bannerFile) {
                const blobData = await uploadBlob(bannerFile, "UserBanner");
                await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_BANNER_IMAGE, {
                    input: { 
                        userId: user.id,
                        bannerPicBlobId: blobData.id 
                    }
                });
                showToast("Banner uploaded successfully", "success");
            }

            // Navigate back to profile
            showToast("Profile updated successfully", "success");
            if (user && user.id) {
                navigate(`/profile/${user.id}`);
            }
        });
    };

    if (loading && !user) {
        return (
            <div className={styles.editLayout}>
                <Navbar />
                <div className={styles.editContent}>
                    <Sidebar />
                    <LoadingSpinner />
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
                    <h2>Edit Profile</h2>

                    <div className={styles.optionSection}>
                        <ImageUploadButton
                            label="Profile Picture"
                            preview={pfp}
                            onImageSelect={handleProfileImageSelect}
                            onImageRemove={handleProfileImageRemove}
                            onUrlChange={setPfp}
                            urlValue={pfp}
                            type="profile"
                            showUrlInput={true}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <ImageUploadButton
                            label="Banner"
                            preview={banner}
                            onImageSelect={handleBannerImageSelect}
                            onImageRemove={handleBannerImageRemove}
                            onUrlChange={setBanner}
                            urlValue={banner}
                            type="banner"
                            showUrlInput={true}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>Name</label>
                        <input
                            className={styles.nameInput}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>

                    <div className={styles.optionSection}>
                        <label>About</label>
                        <textarea value={abt} onChange={(e) => setAbt(e.target.value)} />
                    </div>

                    <button className={styles.editBtn} onClick={handleSave} disabled={blobUploading || saving}>
                        {blobUploading || saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
