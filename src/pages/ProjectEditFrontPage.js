import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/ProfilePageEdit.css";
import { useNavigate } from "react-router-dom";
import shrimp from "../images/shrimp.png";

export default function ProjectEditPage() {
    const project = {
        name: "Shrimp Tracker",
        description: "A small app",
        banner: "https://picsum.photos/900/200?random=10",
        logo: shrimp
    };

    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [banner, setBanner] = useState(project.banner);
    const [logo, setLogo] = useState(project.logo);

    const navigate = useNavigate();

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === "logo") setLogo(reader.result);
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
                    <h2>Edit Project Frontpage</h2>

                    <div className="option-section image-section">
                        <label>Project Logo</label>
                        <img src={logo} alt="Logo" className="preview-image" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "logo")}
                        />
                        <input
                            type="text"
                            value={logo}
                            onChange={(e) => setLogo(e.target.value)}
                            placeholder="Or enter logo URL"
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
                        <label>Project Name</label>
                        <input
                            className="name-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="option-section">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write a short description of your project..."
                        />
                    </div>

                    <button className="edit-btn" onClick={() => navigate("/project")}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
