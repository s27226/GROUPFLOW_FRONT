import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Trending from "../../common/Trending";
import "./Layout.css";
import "../../../styles/MainComponents.css";

/**
 * Main layout component with Navbar, Sidebar, and optional Trending sidebar
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content to render
 * @param {boolean} props.showTrending - Whether to show the trending sidebar (default: true)
 * @param {string} props.variant - Layout variant: "main" or "compact" (default: "main")
 */
export default function Layout({ children, showTrending = true, variant = "main" }) {
    const layoutClass = variant === "main" ? "mainpage-layout" : "maincomp-layout";
    const contentWrapperClass =
        variant === "main" ? "mainpage-feed-trending-wrapper" : "maincomp-center-wrapper";
    const feedWrapperClass = variant === "main" ? "mainpage-feed-wrapper" : "maincomp-feed-wrapper";

    return (
        <div className={layoutClass}>
            <Navbar />
            <div className={variant === "main" ? "mainpage-content" : "maincomp-content"}>
                <Sidebar />
                {showTrending ? (
                    <div className={contentWrapperClass}>
                        <div className={feedWrapperClass}>{children}</div>
                        <Trending />
                    </div>
                ) : (
                    <div className={feedWrapperClass}>{children}</div>
                )}
            </div>
        </div>
    );
}
