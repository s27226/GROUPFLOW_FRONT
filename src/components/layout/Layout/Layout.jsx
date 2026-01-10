import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Trending from "../../common/Trending";
import styles from "./Layout.module.css";


/**
 * Main layout component with Navbar, Sidebar, and optional Trending sidebar
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content to render
 * @param {boolean} props.showTrending - Whether to show the trending sidebar (default: true)
 * @param {string} props.variant - Layout variant: "main" or "compact" (default: "main")
 */
export default function Layout({ children, showTrending = true, variant = "main" }) {
    const layoutClass = variant === "main" ? styles.mainpageLayout : styles.maincompLayout;
    const contentWrapperClass =
        variant === "main" ? styles.mainpageFeedTrendingWrapper : styles.maincompCenterWrapper;
    const feedWrapperClass = variant === "main" ? styles.mainpageFeedWrapper : styles.maincompFeedWrapper;

    return (
        <div className={layoutClass}>
            <Navbar />
            <div className={variant === "main" ? styles.mainpageContent : styles.maincompContent}>
                <Sidebar />
                <div className={contentWrapperClass}>
                    <div className={feedWrapperClass}>{children}</div>
                    {showTrending && <Trending />}
                </div>
            </div>
        </div>
    );
}
