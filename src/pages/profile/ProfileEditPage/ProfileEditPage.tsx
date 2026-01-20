import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Sidebar } from "../../../components/layout";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { ImageUploadButton, ImageSelectData } from "../../../components/profile";
import styles from "./ProfileEditPage.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery, useBlobUpload, useMutation } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { getProfilePicUrl, getBannerUrl } from "../../../utils/profilePicture";

interface UserProfile {
    id: string;
    name?: string;
    surname?: string;
    nickname?: string;
    bio?: string;
    bannerPicUrl?: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface UserProfileResponse {
    users?: {
        me?: UserProfile;
    };
}

export default function ProfileEditPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { uploadBlob, deleteBlob, uploading: blobUploading } = useBlobUpload();
    const { showToast } = useToast();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [nickname, setNickname] = useState("");
    const [aboutMe, setAboutMe] = useState("");
    const [banner, setBanner] = useState("");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [pfp, setPfp] = useState("");
    const [pfpFile, setPfpFile] = useState<File | null>(null);

    const { data: user, loading } = useQuery<UserProfile | null>(
        GRAPHQL_QUERIES.GET_CURRENT_USER,
        {},
        {
            transform: (data: unknown) => {
                const typedData = data as UserProfileResponse;
                return typedData?.users?.me || null;
            },
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
            setSurname(user.surname || "");
            setNickname(user.nickname || "");
            setAboutMe(user.bio || "");
            setBanner(getBannerUrl(user.bannerPicUrl, 10));
            setPfp(getProfilePicUrl(user.profilePicUrl, user.nickname));
        }
    }, [user]);

    const handleProfileImageSelect = (data: ImageSelectData) => {
        setPfpFile(data.file);
        setPfp(typeof data.preview === 'string' ? data.preview : "");
    };

    const handleProfileImageRemove = async () => {
        // Reset profile picture to default
        if (user) {
            await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_PROFILE_IMAGE, {
                input: { 
                    userId: parseInt(user.id),
                    profilePicBlobId: null 
                }
            });
            showToast(t('profile.profilePicRemoved'), "success");
        }
        setPfpFile(null);
        setPfp(getProfilePicUrl(null, user?.nickname));
    };

    const handleBannerImageSelect = (data: ImageSelectData) => {
        setBannerFile(data.file);
        setBanner(typeof data.preview === 'string' ? data.preview : "");
    };

    const handleBannerImageRemove = async () => {
        // Reset banner to default
        if (user) {
            await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_BANNER_IMAGE, {
                input: { 
                    userId: parseInt(user.id),
                    bannerPicBlobId: null 
                }
            });
            showToast(t('profile.bannerRemoved'), "success");
        }
        setBannerFile(null);
        setBanner(getBannerUrl(null, 10));
    };

    const handleSave = async () => {
        if (!user) return;
        
        await saveProfile(async () => {
            // Update basic profile info (name, surname, nickname, aboutMe)
            await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_PROFILE, {
                input: {
                    name: name,
                    surname: surname,
                    nickname: nickname,
                    bio: aboutMe
                }
            });

            // Upload profile picture to S3 if a new file was selected
            if (pfpFile) {
                const blobData = await uploadBlob(pfpFile, "profile");
                if (blobData) {
                    await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_PROFILE_IMAGE, {
                        input: { 
                            userId: parseInt(user.id),
                            profilePicBlobId: blobData.id 
                        }
                    });
                    showToast(t('profile.profilePicUploaded'), "success");
                }
            }

            // Upload banner to S3 if a new file was selected
            if (bannerFile) {
                const blobData = await uploadBlob(bannerFile, "profile");
                if (blobData) {
                    await executeMutation(GRAPHQL_MUTATIONS.UPDATE_USER_BANNER_IMAGE, {
                        input: { 
                            userId: parseInt(user.id),
                            bannerPicBlobId: blobData.id 
                        }
                    });
                    showToast(t('profile.bannerUploaded'), "success");
                }
            }

            // Navigate back to profile
            showToast(t('profile.profileUpdated'), "success");
            if (user.id) {
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
                    <h2>{t('profile.editProfile')}</h2>

                    <div className={styles.optionSection}>
                        <ImageUploadButton
                            label={t('profile.profilePicture')}
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
                            label={t('profile.banner')}
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
                        <label>{t('profile.name')}</label>
                        <input
                            className={styles.nameInput}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>{t('profile.surname')}</label>
                        <input
                            className={styles.nameInput}
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>{t('profile.nickname')}</label>
                        <input
                            className={styles.nameInput}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </div>

                    <div className={styles.optionSection}>
                        <label>{t('profile.aboutMe')}</label>
                        <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} />
                    </div>

                    <button className={styles.editBtn} onClick={handleSave} disabled={blobUploading || saving}>
                        {blobUploading || saving ? t('common.saving') : t('profile.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
}
