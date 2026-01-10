import React, { useEffect, useState } from "react";
import "../skeletons.css";

interface LoadingBarProps {
    loading?: boolean;
}

/**
 * Top loading bar component for route transitions
 * Prevents FOUC during page navigation
 */
export default function LoadingBar({ loading = false }: LoadingBarProps): React.ReactElement | null {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (loading) {
            setVisible(true);
            setProgress(0);

            // Simulate progress
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            return () => clearInterval(interval);
        } else {
            // Complete the progress
            setProgress(100);
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
        }
    }, [loading]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: "var(--bg-secondary)",
                zIndex: 9999
            }}
        >
            <div
                style={{
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: "var(--accent)",
                    transition: "width 0.3s ease",
                    boxShadow: "0 0 10px var(--accent)"
                }}
            ></div>
        </div>
    );
}
