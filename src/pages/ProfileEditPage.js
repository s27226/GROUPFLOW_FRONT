import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/ProfilePageEdit.css";
import { useNavigate } from "react-router-dom";

export default function ProfileEditPage() {
    const user = {
        name: "John",
        handle: "@John",
        bio: "Professional homeless man",
        banner: "https://picsum.photos/900/200?random=10",
        pfp: "https://api.dicebear.com/9.x/identicon/svg?seed=ShrimpDev",
        abt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    };

    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [banner, setBanner] = useState(user.banner);
    const [pfp, setPfp] = useState(user.pfp);
    const [abt, setAbt] = useState(user.abt);

    const navigate = useNavigate();

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
                        <input className="name-input" value={name} onChange={(e) => setName(e.target.value)}/>
                    </div>

                    <div className="option-section">
                        <label>Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>

                    <div className="option-section">
                        <label>About</label>
                        <textarea value={abt} onChange={(e) => setAbt(e.target.value)} />
                    </div>

                    <button className="edit-btn" onClick={() => navigate("/profile")}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
