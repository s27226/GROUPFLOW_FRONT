import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import CreateGroup from "../components/CreateGroup";
import "../styles/MainComponents.css";



export default function CreateGroupPage() {


    return (
        <div className="main-layout">
            <Navbar />
            <div className="main-content">
                <Sidebar />
                <div className="center-wrapper">
                    <div className="feed-wrapper">
                       <CreateGroup />
                    </div>

                </div>
            </div>
        </div>
    );
}