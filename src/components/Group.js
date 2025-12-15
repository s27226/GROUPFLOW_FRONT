import "../styles/Groups.css";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/dateFormatter";

export default function Group({
    id,
    name,
    description,
    imageUrl,
    owner,
    viewCount,
    likeCount,
    created
}) {
    const navigate = useNavigate();

    return (
        <div className="group-card" onClick={() => navigate(`/project/${id}`)}>
            {imageUrl && (
                <div className="group-image">
                    <img src={imageUrl} alt={name} />
                </div>
            )}
            <div className="group-header">
                <div>
                    <h3 className="group-name">{name}</h3>
                    {owner && (
                        <p className="group-owner">
                            by{" "}
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${owner.id}`);
                                }}
                                style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontWeight: "500"
                                }}
                            >
                                {owner.nickname || owner.name}
                            </span>
                        </p>
                    )}
                </div>
            </div>

            <div className="group-content">
                <p>{description || "No description available"}</p>
            </div>

            <div className="group-footer">
                <div className="group-stats">
                    {likeCount !== undefined && <span>👍 {likeCount} likes</span>}
                    {viewCount !== undefined && <span>👁 {viewCount} views</span>}
                </div>
                {created && (
                    <div className="group-date">
                        <span>Created: {formatDate(created)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
