import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import { useQuery, useMutationQuery } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { formatTime } from "../../../utils/dateFormatter";
import { AlertTriangle, Trash2, XCircle, ChevronLeft, ShieldAlert } from "lucide-react";
import { Navbar, Sidebar } from "../../../components/layout";
import { getProfilePicUrl } from "../../../utils/profilePicture";
import styles from "./ReportedPostsPage.module.css";

interface ReportedUser {
    nickname?: string;
    name?: string;
    profilePic?: string;
    profilePicUrl?: string;
}

interface ReportedPost {
    id: string;
    content?: string;
    title?: string;
    imageUrl?: string;
    created?: string;
    user?: ReportedUser;
}

interface Report {
    id: string;
    reason?: string;
    createdAt: string;
    reportedByUser?: ReportedUser;
    post?: ReportedPost;
}

interface ReportedPostsResponse {
    admin?: {
        reportedPosts?: Report[];
    };
}

interface MutationResponse {
    errors?: Array<{ message?: string }>;
}

export default function ReportedPostsPage() {
    const { isModerator } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [actioningId, setActioningId] = useState<string | null>(null);

    useEffect(() => {
        if (!isModerator) {
            navigate("/");
        }
    }, [isModerator, navigate]);

    const { data: reports, loading, setData: setReports } = useQuery<Report[]>(
        GRAPHQL_QUERIES.GET_REPORTED_POSTS,
        {},
        {
            skip: !isModerator,
            transform: (data: unknown) => {
                const typedData = data as ReportedPostsResponse | null;
                return typedData?.admin?.reportedPosts || [];
            },
            initialData: [],
            onError: () => showToast("An error occurred while loading reported posts", "error")
        }
    );

    const { execute: executeMutation } = useMutationQuery({
        onError: (error: Error) => showToast(error.message || "An error occurred", "error")
    });

    const handleDeletePost = async (postId: string, reportId: string) => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }

        setActioningId(reportId);
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.DELETE_REPORTED_POST, {
                postId
            }) as MutationResponse | null;

            if (!response?.errors) {
                showToast("Post deleted successfully", "success");
                setReports((reports ?? []).filter(r => r.id !== reportId));
            } else {
                const errorMessage = response.errors[0]?.message || "Failed to delete post";
                showToast(errorMessage, "error");
            }
        } finally {
            setActioningId(null);
        }
    };

    const handleDiscardReport = async (reportId: string) => {
        setActioningId(reportId);
        try {
            const response = await executeMutation(GRAPHQL_MUTATIONS.DISCARD_REPORT, {
                reportId
            }) as MutationResponse | null;

            if (!response?.errors) {
                showToast("Report discarded successfully", "success");
                setReports((reports ?? []).filter(r => r.id !== reportId));
            } else {
                const errorMessage = response.errors[0]?.message || "Failed to discard report";
                showToast(errorMessage, "error");
            }
        } finally {
            setActioningId(null);
        }
    };

    if (!isModerator) {
        return null;
    }

    return (
        <div className={styles.pageLayout}>
            <Navbar />
            <div className={styles.pageContent}>
                <Sidebar />
                <main className={styles.rppPage}>
                    <div className={styles.rppHeader}>
                        <button className={styles.rppBackButton} onClick={() => navigate(-1)}>
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </button>
                        <div className={styles.rppHeaderTitle}>
                            <ShieldAlert size={28} className={styles.rppHeaderIcon} />
                            <h1>Reported Posts</h1>
                        </div>
                        <p className={styles.rppHeaderSubtitle}>
                            Review and manage posts that have been reported by users
                        </p>
                    </div>

                    {loading ? (
                        <div className={styles.rppLoadingState}>
                            <div className={styles.rppSpinner}></div>
                            <p>Loading reported posts...</p>
                        </div>
                    ) : (reports ?? []).length === 0 ? (
                        <div className={styles.rppEmptyState}>
                            <div className={styles.rppEmptyIcon}>
                                <ShieldAlert size={64} strokeWidth={1.5} />
                            </div>
                            <h2>No reported posts</h2>
                            <p className={styles.rppEmptyDescription}>
                                There are no active reports at this time. When users report inappropriate content,
                                it will appear here for moderation.
                            </p>
                            <div className={styles.rppInfoBox}>
                                <AlertTriangle size={18} />
                                <span>Keep the community safe by reviewing reports promptly</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.rppReportsCount}>
                                <span>{(reports ?? []).length} {(reports ?? []).length === 1 ? 'report' : 'reports'} pending</span>
                            </div>
                            <div className={styles.rppReportsGrid}>
                                {(reports ?? []).map((report) => (
                                    <div key={report.id} className={styles.rppReportCard}>
                                        <div className={styles.rppReportHeaderInfo}>
                                            <div className={styles.rppReporterInfo}>
                                                <img
                                                    src={getProfilePicUrl(report.reportedByUser?.profilePicUrl, report.reportedByUser?.nickname)}
                                                    alt={report.reportedByUser?.nickname}
                                                    className={styles.rppReporterAvatar}
                                                />
                                                <div>
                                                    <p className={styles.rppReportedBy}>
                                                        Reported by <strong>{report.reportedByUser?.nickname}</strong>
                                                    </p>
                                                    <p className={styles.rppReportDate}>{formatTime(report.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className={styles.rppReportBadge}>
                                                <AlertTriangle size={16} />
                                            </div>
                                        </div>

                                        <div className={styles.rppReportReason}>
                                            <strong>Reason:</strong>
                                            <p>{report.reason}</p>
                                        </div>

                                        <div className={styles.rppReportedPostPreview}>
                                            <div className={styles.rppPostAuthor}>
                                                <img
                                                    src={getProfilePicUrl(report.post?.user?.profilePicUrl, report.post?.user?.nickname)}
                                                    alt={report.post?.user?.nickname}
                                                    className={styles.rppPostAuthorAvatar}
                                                />
                                                <div>
                                                    <p className={styles.rppAuthorName}>
                                                        {report.post?.user?.nickname || report.post?.user?.name}
                                                    </p>
                                                    <p className={styles.rppPostDate}>{formatTime(report.post?.created)}</p>
                                                </div>
                                            </div>

                                            <div className={styles.rppPostContentPreview}>
                                                {report.post?.title && <h4>{report.post.title}</h4>}
                                                <p>{report.post?.content}</p>
                                                {report.post?.imageUrl && (
                                                    <img
                                                        src={report.post.imageUrl}
                                                        alt="Post"
                                                        className={styles.rppPostPreviewImage}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.rppReportActions}>
                                            <button
                                                className={`${styles.rppActionBtn} ${styles.rppDiscardBtn} ${actioningId === report.id ? styles.loading : ''}`}
                                                onClick={() => handleDiscardReport(report.id)}
                                                disabled={actioningId === report.id}
                                            >
                                                {actioningId === report.id ? (
                                                    <span className={styles.rppButtonSpinner}></span>
                                                ) : (
                                                    <>
                                                        <XCircle size={18} />
                                                        <span>Discard</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className={`${styles.rppActionBtn} ${styles.rppDeleteBtn} ${actioningId === report.id ? styles.loading : ''}`}
                                                onClick={() => handleDeletePost(report.post?.id ?? '', report.id)}
                                                disabled={actioningId === report.id}
                                            >
                                                {actioningId === report.id ? (
                                                    <span className={styles.rppButtonSpinner}></span>
                                                ) : (
                                                    <>
                                                        <Trash2 size={18} />
                                                        <span>Delete Post</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
