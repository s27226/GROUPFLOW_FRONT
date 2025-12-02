import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import Trending from "../components/Trending";
import "../styles/MainPage.css";
import shrimp from "../images/shrimp.png";

export default function MainPage() {
    const trendingProjects = [
        {
            name: "Shrimp Tracker",
            description: "A small app to track your shrimp collection",
            image: shrimp,
        },
        {
            name: "Task Manager 2",
            description: "Some more hardcoded posts for designing stuff",
            image: "https://picsum.photos/60?random=2",
        },
        {
            name: "Defenestrator",
            description: "should replace those when we have proper project sites ready",
            image: "https://picsum.photos/60?random=3",
        },
    ];

    return (
        <div className="mainpage-layout">
            <Navbar />
            <div className="mainpage-content">
                <Sidebar />
                <div className="mainpage-feed-trending-wrapper">
                    <div className="mainpage-feed-wrapper">
                        <Feed />
                    </div>
                    <Trending projects={trendingProjects} />
                </div>
            </div>
        </div>
    );
}
