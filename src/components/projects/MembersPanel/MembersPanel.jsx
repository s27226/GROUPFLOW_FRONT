import styles from "./MembersPanel.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useGraphQL } from "../../../hooks";
import { GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useState } from "react";
import ConfirmDialog from "../../ui/ConfirmDialog";

export default function MembersPanel({ project, projectId }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { executeMutation } = useGraphQL();
    const [removeConfirm, setRemoveConfirm] = useState({ show: false, memberId: null, memberName: "" });

    const isOwner = user && project?.owner?.id === user.id;

    const handleRemoveMember = async (memberId, memberName) => {
        setRemoveConfirm({ show: true, memberId, memberName });
    };

    const confirmRemoveMember = async () => {
        const { memberId } = removeConfirm;
        setRemoveConfirm({ show: false, memberId: null, memberName: "" });

        try {
            await executeMutation(GRAPHQL_MUTATIONS.REMOVE_PROJECT_MEMBER, {
                projectId: parseInt(projectId),
                userId: memberId
            });

            // Reload the page to refresh the members list
            window.location.reload();
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };

    const members =
        project?.collaborators?.map((collab) => ({
            id: collab.user.id,
            name: `${collab.user.name} ${collab.user.surname}`,
            nickname: collab.user.nickname,
            role: collab.role,
            avatar: collab.user.profilePic || `https://i.pravatar.cc/40?u=${collab.user.id}`,
            status: "available"
        })) || [];

    if (project?.owner) {
        members.unshift({
            id: project.owner.id,
            name: `${project.owner.name} ${project.owner.surname}`,
            nickname: project.owner.nickname,
            role: "Owner",
            avatar: project.owner.profilePic || `https://i.pravatar.cc/40?u=${project.owner.id}`,
            status: "available"
        });
    }

    return (
        <div className={styles.projectMembersPanel}>
            <h3>Członkowie projektu</h3>
            {members.length === 0 ? (
                <p style={{ color: "#8b8b8b", fontSize: "0.9rem", padding: "10px" }}>
                    No members yet
                </p>
            ) : (
                <div className={styles.membersList}>
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={`${styles.memberItem} ${styles[member.status]}`}
                        >
                            <div
                                className={styles.memberHeader}
                                onClick={() => navigate(`/profile/${member.id}`)}
                                style={{ cursor: "pointer", flex: 1 }}
                            >
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className={styles.memberAvatar}
                                />
                                <span className={styles.statusDot} />
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>
                                        {member.nickname || member.name}
                                    </span>
                                    <span className={styles.memberRole}>{member.role}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className={styles.statusText}>
                                    {member.status === "available"
                                        ? "Dostępny"
                                        : member.status === "away"
                                          ? "Za chwilę wracam"
                                          : "Niedostępny"}
                                </span>
                                {isOwner && member.role !== "Owner" && (
                                    <button
                                        className={styles.removeMemberBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMember(member.id, member.nickname || member.name);
                                        }}
                                        title="Remove member"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={removeConfirm.show}
                title="Remove Member"
                message={`Are you sure you want to remove ${removeConfirm.memberName} from this project?`}
                confirmText="Remove"
                cancelText="Cancel"
                danger={true}
                onConfirm={confirmRemoveMember}
                onCancel={() => setRemoveConfirm({ show: false, memberId: null, memberName: "" })}
            />
        </div>
    );
}
