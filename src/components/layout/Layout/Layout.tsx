import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Trending from "../../common/Trending";
import styles from "./Layout.module.css";

type LayoutVariant = 'main' | 'compact';

interface LayoutProps {
    children: React.ReactNode;
    showTrending?: boolean;
    variant?: LayoutVariant;
}

/**
 * Main layout component with Navbar, Sidebar, and optional Trending sidebar
 */
export default function Layout({ children, showTrending = true, variant = "main" }: LayoutProps) {
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
