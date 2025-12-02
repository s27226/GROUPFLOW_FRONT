import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import CreateGroup from "../components/CreateGroup";
import "../styles/MainComponents.css";



export default function CreateGroupPage() {


    return (
        <div className="maincomp-layout">
            <Navbar />
            <div className="maincomp-content">
                <Sidebar />
                <div className="maincomp-center-wrapper">
                    <div className="maincomp-feed-wrapper">
                       <CreateGroup />
                    </div>

                </div>
            </div>
        </div>
    );
}