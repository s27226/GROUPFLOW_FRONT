import { GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useMutationQuery } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { translateError } from "../../../utils/errorTranslation";
import styles from "./Invitation.module.css";

interface InvitationData {
    id: number;
    name: string;
    type: 'friend' | 'group' | 'project';
}

interface InvitationProps {
    data: InvitationData;
    onRemove: (id: number, type?: string) => void;
}

export default function Invitation({ data, onRemove }: InvitationProps) {
    const { showToast } = useToast();

    const { mutate: acceptFriend, loading: acceptingFriend } = useMutationQuery(
        GRAPHQL_MUTATIONS.ACCEPT_FRIEND_REQUEST,
        {
            onSuccess: () => onRemove(data.id, data.type),
            onError: (err) => showToast(translateError(err.message, 'invitations.acceptFailed'), "error")
        }
    );

    const { mutate: acceptProject, loading: acceptingProject } = useMutationQuery(
        GRAPHQL_MUTATIONS.ACCEPT_PROJECT_INVITATION,
        {
            onSuccess: () => onRemove(data.id, data.type),
            onError: (err) => showToast(translateError(err.message, 'invitations.acceptFailed'), "error")
        }
    );

    const { mutate: rejectFriend, loading: rejectingFriend } = useMutationQuery(
        GRAPHQL_MUTATIONS.REJECT_FRIEND_REQUEST,
        {
            onSuccess: () => onRemove(data.id, data.type),
            onError: (err) => showToast(translateError(err.message, 'invitations.rejectFailed'), "error")
        }
    );

    const { mutate: rejectProject, loading: rejectingProject } = useMutationQuery(
        GRAPHQL_MUTATIONS.REJECT_PROJECT_INVITATION,
        {
            onSuccess: () => onRemove(data.id, data.type),
            onError: (err) => showToast(translateError(err.message, 'invitations.rejectFailed'), "error")
        }
    );

    const loading = acceptingFriend || acceptingProject || rejectingFriend || rejectingProject;

    const handleAccept = async () => {
        if (data.type === "friend") {
            await acceptFriend({ friendRequestId: data.id });
        } else if (data.type === "group" || data.type === "project") {
            await acceptProject({ invitationId: data.id });
        } else {
            onRemove(data.id);
        }
    };

    const handleReject = async () => {
        if (data.type === "friend") {
            await rejectFriend({ friendRequestId: data.id });
        } else if (data.type === "group" || data.type === "project") {
            await rejectProject({ invitationId: data.id });
        } else {
            onRemove(data.id);
        }
    };

    return (
        <div className={styles.invitationCard}>
            <div className={styles.info}>
                <h3>{data.name}</h3>
                <span className={styles.type}>
                    {data.type === "friend" ? "Friend Request" : 
                     data.type === "project" ? "Project Invite" : "Group Invite"}
                </span>
            </div>

            <div className={styles.actions}>
                <button className={styles.acceptBtn} onClick={handleAccept} disabled={loading}>
                    {loading ? "..." : "Accept"}
                </button>
                <button className={styles.rejectBtn} onClick={handleReject} disabled={loading}>
                    {loading ? "..." : "Reject"}
                </button>
            </div>
        </div>
    );
}
