import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./MembersPanel.module.css";
import { useAuth } from "../../../context/AuthContext";
import { useGraphQL } from "../../../hooks";
import { GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { getProfilePicUrl } from "../../../utils/profilePicture";

interface ProjectUser {
    id: string;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface Collaborator {
    user: ProjectUser;
    role: string;
}

interface ProjectData {
    owner?: ProjectUser;
    collaborators?: Collaborator[];
}

interface RemoveConfirmState {
    show: boolean;
    memberId: string | null;
    memberName: string;
}

interface MembersPanelProps {
    project: ProjectData | null;
    projectId: string;
}

export default function MembersPanel({ project, projectId }: MembersPanelProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { executeMutation } = useGraphQL();
    const [removeConfirm, setRemoveConfirm] = useState<RemoveConfirmState>({ show: false, memberId: null, memberName: "" });

    const isOwner = user && project?.owner?.id && Number(project.owner.id) === user.id;

    const handleRemoveMember = async (memberId: string, memberName: string): Promise<void> => {
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
            avatar: getProfilePicUrl(collab.user.profilePicUrl, collab.user.nickname || collab.user.id),
            status: "available"
        })) || [];

    if (project?.owner) {
        members.unshift({
            id: project.owner.id,
            name: `${project.owner.name} ${project.owner.surname}`,
            nickname: project.owner.nickname,
            role: "Owner",
            avatar: getProfilePicUrl(project.owner.profilePicUrl, project.owner.nickname || project.owner.id),
            status: "available"
        });
    }

    return (
        <div className={styles.projectMembersPanel}>
            <h3>{t('projects.projectMembers')}</h3>
            {members.length === 0 ? (
                <p style={{ color: "#8b8b8b", fontSize: "0.9rem", padding: "10px" }}>
                    {t('projects.noMembers')}
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
                                        ? t('projects.available')
                                        : member.status === "away"
                                          ? t('projects.away')
                                          : t('projects.unavailable')}
                                </span>
                                {isOwner && member.role !== "Owner" && (
                                    <button
                                        className={styles.removeMemberBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMember(member.id, member.nickname || member.name);
                                        }}
                                        title={t('projects.removeMember')}
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
                title={t('projects.removeMemberTitle')}
                message={t('projects.removeMemberConfirm', { name: removeConfirm.memberName })}
                confirmText={t('common.remove')}
                cancelText={t('common.cancel')}
                danger={true}
                onConfirm={confirmRemoveMember}
                onCancel={() => setRemoveConfirm({ show: false, memberId: null, memberName: "" })}
            />
        </div>
    );
}
