import "../skeletons.css";

/**
 * Skeleton loader for Post component
 * Prevents FOUC while posts are loading
 */
export default function SkeletonPost({ count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-post">
                    <div className="skeleton-post-header">
                        <div className="skeleton skeleton-avatar"></div>
                        <div className="skeleton-post-info">
                            <div className="skeleton skeleton-author"></div>
                            <div className="skeleton skeleton-time"></div>
                        </div>
                    </div>

                    <div className="skeleton-content">
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text"></div>
                    </div>

                    {/* Random image for some posts */}
                    {index % 2 === 0 && <div className="skeleton skeleton-image"></div>}

                    <div className="skeleton-actions">
                        <div className="skeleton skeleton-action"></div>
                        <div className="skeleton skeleton-action"></div>
                        <div className="skeleton skeleton-action"></div>
                    </div>
                </div>
            ))}
        </>
    );
}
