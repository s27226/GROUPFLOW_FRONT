import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ImageUploadButton from "../components/ImageUploadButton";
import "../styles/ProfilePageEdit.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";
import { useBlobUpload } from "../hooks/useBlobUpload";
import { useToast } from "../context/ToastContext";

export default function ProfileEditPage() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { executeQuery, executeMutation } = useGraphQL();
    const { uploadBlob, deleteBlob, uploading: blobUploading } = useBlobUpload();
    const { showToast } = useToast();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [banner, setBanner] = useState("");
    const [bannerFile, setBannerFile] = useState(null);
    const [pfp, setPfp] = useState("");
    const [pfpFile, setPfpFile] = useState(null);
    const [abt, setAbt] = useState("");

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_CURRENT_USER, {});

                if (!data) {
                    console.error("Failed to fetch user");
                    setLoading(false);
                    return;
                }

                const userData = data.users.me;
                setUser(userData);
                setName(userData.name || "");
                setBio(userData.bio || "");
                // Use blob URL if available, otherwise fallback to old URL
                setBanner(userData.bannerPicUrl || userData.bannerPic || "https://picsum.photos/900/200?random=10");
                setPfp(
                    userData.profilePicUrl || userData.profilePic ||
                        `https://api.dicebear.com/9.x/identicon/svg?seed=${userData.nickname}`
                );
                setAbt(userData.about || "");
                setLoading(false);
            } catch (err) {
                console.error("Error fetching user:", err);
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, [executeQuery]);

    const handleProfileImageSelect = ({ file, preview }) => {
        setPfpFile(file);
        setPfp(preview);
    };

    const handleProfileImageRemove = async () => {
        // If user has a blob ID, delete the blob from S3
        if (user?.profilePicBlobId) {
            try {
                await deleteBlob(user.profilePicBlobId);
                // Update user to remove blob ID
                await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_PROFILE_IMAGE, {
                    input: { 
                        userId: user.id,
                        profilePicBlobId: null 
                    }
                });
                showToast("Profile picture removed", "success");
            } catch (err) {
                console.error("Failed to delete profile picture:", err);
                showToast("Failed to remove profile picture", "error");
            }
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
            try {
                await deleteBlob(user.bannerPicBlobId);
                // Update user to remove blob ID
                await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_BANNER_IMAGE, {
                    input: { 
                        userId: user.id,
                        bannerPicBlobId: null 
                    }
                });
                showToast("Banner removed", "success");
            } catch (err) {
                console.error("Failed to delete banner:", err);
                showToast("Failed to remove banner", "error");
            }
        }
        setBannerFile(null);
        setBanner("https://picsum.photos/900/200?random=10");
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Upload profile picture to S3 if a new file was selected
            if (pfpFile) {
                try {
                    const blobData = await uploadBlob(pfpFile, "UserProfilePicture");
                    // Update user profile image blob ID
                    await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_PROFILE_IMAGE, {
                        input: { 
                            userId: user.id,
                            profilePicBlobId: blobData.id 
                        }
                    });
                    showToast("Profile picture uploaded successfully", "success");
                } catch (err) {
                    showToast("Failed to upload profile picture: " + err.message, "error");
                    setLoading(false);
                    return;
                }
            }

            // Upload banner to S3 if a new file was selected
            if (bannerFile) {
                try {
                    const blobData = await uploadBlob(bannerFile, "UserBanner");
                    // Update user banner image blob ID
                    await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_BANNER_IMAGE, {
                        input: { 
                            userId: user.id,
                            bannerPicBlobId: blobData.id 
                        }
                    });
                    showToast("Banner uploaded successfully", "success");
                } catch (err) {
                    showToast("Failed to upload banner: " + err.message, "error");
                    setLoading(false);
                    return;
                }
            }

            // Navigate back to profile
            showToast("Profile updated successfully", "success");
            if (user && user.id) {
                navigate(`/profile/${user.id}`);
            }
        } catch (err) {
            console.error("Error saving profile:", err);
            showToast("Failed to save profile changes", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="edit-layout">
                <Navbar />
                <div className="edit-content">
                    <Sidebar />
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="edit-layout">
            <Navbar />
            <div className="edit-content">
                <Sidebar />

                <div className="edit-main">
                    <h2>Edit Profile</h2>

                    <div className="option-section">
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

                    <div className="option-section">
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

                    <div className="option-section">
                        <label>Name</label>
                        <input
                            className="name-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="option-section">
                        <label>Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>

                    <div className="option-section">
                        <label>About</label>
                        <textarea value={abt} onChange={(e) => setAbt(e.target.value)} />
                    </div>

                    <button className="edit-btn" onClick={handleSave} disabled={blobUploading || loading}>
                        {blobUploading || loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
