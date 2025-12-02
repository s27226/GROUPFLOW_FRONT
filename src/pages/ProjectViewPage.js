import React, {useState} from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

import "../styles/ProjectViewPage.css";
import {useNavigate, useParams} from "react-router-dom";
import FilesView from "../components/FilesView";
import TerminsView from "../components/TerminsView";
import MembersPanel from "../components/MembersPanel";


export default function ProjectsViewPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("messages"); // domyślnie chat

    const renderContent = () => {
        switch (activeTab) {
            case "files":
                return <FilesView projectId={id} />;
            case "termins":
                return <TerminsView projectId={id} />;
            default:
                return <ChatBox projectId={id} />;
        }
    };


    return (
        <div className="view-page-main-layout">
            <Navbar />
            <div className="view-page-main-content">
                <Sidebar />
                <div className="feed-projects-wrapper">
                    <div className="main-feed-wrapper">

                        <button className="back-btn" onClick={() => navigate("/myprojects")}>
                            ← Back to projects
                        </button>

                        <div className="tabs">
                            <button
                                className={`tab-btn ${activeTab === "files" ? "active" : ""}`}
                                onClick={() => setActiveTab("files")}
                            >
                                📁 Files
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
                                onClick={() => setActiveTab("messages")}
                            >
                                ✉️ Messages
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "termins" ? "active" : ""}`}
                                onClick={() => setActiveTab("termins")}
                            >
                                🕒 Termins
                            </button>


                        </div>
                        <div className="tab-content">{renderContent()}</div>
                    </div>
                    <MembersPanel/>
                </div>
            </div>
        </div>
            );
            }