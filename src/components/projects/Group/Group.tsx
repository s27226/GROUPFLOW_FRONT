import styles from "../Groups/Groups.module.css";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../utils/dateFormatter";

interface GroupOwner {
    id: string;
    nickname?: string;
    name?: string;
}

interface GroupProps {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    owner?: GroupOwner;
    viewCount?: number;
    likeCount?: number;
    created?: string;
}

export default function Group({
    id,
    name,
    description,
    imageUrl,
    owner,
    viewCount,
    likeCount,
    created
}: GroupProps) {
    const navigate = useNavigate();

    return (
        <div className={styles.groupCard} onClick={() => navigate(`/project/${id}`)}>
            {imageUrl && (
                <div className={styles.groupImage}>
                    <img src={imageUrl} alt={name} />
                </div>
            )}
            <div className={styles.groupHeader}>
                <div>
                    <h3 className={styles.groupName}>{name}</h3>
                    {owner && (
                        <p className={styles.groupOwner}>
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

            <div className={styles.groupContent}>
                <p>{description || "No description available"}</p>
            </div>

            <div className={styles.groupFooter}>
                <div className={styles.groupStats}>
                    {likeCount !== undefined && <span>❤️ {likeCount} likes</span>}
                    {viewCount !== undefined && <span>👁 {viewCount} views</span>}
                </div>
                {created && (
                    <div className={styles.groupDate}>
                        <span>Created: {formatDate(created)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
