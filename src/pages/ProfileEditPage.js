import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import "../styles/ProfilePageEdit.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import { useGraphQL } from "../hooks/useGraphQL";

export default function ProfileEditPage() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { executeQuery } = useGraphQL();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [banner, setBanner] = useState("");
    const [pfp, setPfp] = useState("");
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
                setBanner(userData.banner || "https://picsum.photos/900/200?random=10");
                setPfp(
                    userData.profilePic ||
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

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === "pfp") setPfp(reader.result);
            if (type === "banner") setBanner(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (user && user.id) {
            navigate(`/profile/${user.id}`);
        }
    };

    if (loading) {
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

                    <div className="option-section image-section">
                        <label>Profile Picture</label>
                        <img src={pfp} alt="Profile" className="preview-image" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "pfp")}
                        />
                        <input
                            type="text"
                            value={pfp}
                            onChange={(e) => setPfp(e.target.value)}
                            placeholder="Or enter image URL"
                        />
                    </div>

                    <div className="option-section image-section">
                        <label>Banner</label>
                        <img src={banner} alt="Banner" className="preview-image banner-preview" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "banner")}
                        />
                        <input
                            type="text"
                            value={banner}
                            onChange={(e) => setBanner(e.target.value)}
                            placeholder="Or enter banner URL"
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

                    <button className="edit-btn" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
