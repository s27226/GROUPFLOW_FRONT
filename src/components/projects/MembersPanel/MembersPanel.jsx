import "./MembersPanel.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useGraphQL } from "../../../hooks/useGraphQL";
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
        <div className="project-members-panel">
            <h3>Członkowie projektu</h3>
            {members.length === 0 ? (
                <p style={{ color: "#8b8b8b", fontSize: "0.9rem", padding: "10px" }}>
                    No members yet
                </p>
            ) : (
                <div className="members-list">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={`member-item ${member.status}`}
                        >
                            <div
                                className="member-header"
                                onClick={() => navigate(`/profile/${member.id}`)}
                                style={{ cursor: "pointer", flex: 1 }}
                            >
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="member-avatar"
                                />
                                <span className="status-dot" />
                                <div className="member-info">
                                    <span className="member-name">
                                        {member.nickname || member.name}
                                    </span>
                                    <span className="member-role">{member.role}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="status-text">
                                    {member.status === "available"
                                        ? "Dostępny"
                                        : member.status === "away"
                                          ? "Za chwilę wracam"
                                          : "Niedostępny"}
                                </span>
                                {isOwner && member.role !== "Owner" && (
                                    <button
                                        className="remove-member-btn"
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
