import "../styles/MembersPanel.css";
import { useNavigate } from "react-router-dom";

export default function MembersPanel({ project, projectId }) {
    const navigate = useNavigate();

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
                            onClick={() => navigate(`/profile/${member.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="member-header">
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
                            <span className="status-text">
                                {member.status === "available"
                                    ? "Dostępny"
                                    : member.status === "away"
                                      ? "Za chwilę wracam"
                                      : "Niedostępny"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
