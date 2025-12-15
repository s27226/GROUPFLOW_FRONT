import "../../styles/skeletons.css";

/**
 * Skeleton card loader for project cards
 * Matches my-project-card dimensions exactly
 */
export default function SkeletonCard({ count = 3 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-project-card">
                    <div className="skeleton skeleton-project-image"></div>
                    <div className="skeleton-project-content">
                        <div className="skeleton skeleton-project-title"></div>
                        <div className="skeleton skeleton-project-description"></div>
                        <div className="skeleton-project-footer">
                            <div className="skeleton skeleton-project-owner"></div>
                            <div className="skeleton skeleton-project-collab"></div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
