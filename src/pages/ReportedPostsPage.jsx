import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthenticatedRequest } from "../hooks/useAuthenticatedRequest";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useToast } from "../context/ToastContext";
import { formatTime } from "../utils/dateFormatter";
import { AlertTriangle, Trash2, XCircle, ChevronLeft, ShieldAlert } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/ReportedPostsPage.css";

export default function ReportedPostsPage() {
    const { isModerator } = useAuth();
    const navigate = useNavigate();
    const { makeRequest } = useAuthenticatedRequest();
    const { showToast } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);

    useEffect(() => {
        if (!isModerator) {
            navigate("/");
            return;
        }

        fetchReportedPosts();
    }, [isModerator, navigate]);

    const fetchReportedPosts = async () => {
        setLoading(true);
        try {
            const response = await makeRequest(GRAPHQL_QUERIES.GET_REPORTED_POSTS);
            
            if (!response.errors && response.data?.admin?.reportedPosts) {
                setReports(response.data.admin.reportedPosts);
            } else {
                console.error("Error fetching reported posts:", response.errors);
                showToast("Failed to load reported posts", "error");
            }
        } catch (error) {
            console.error("Error fetching reported posts:", error);
            showToast("An error occurred while loading reported posts", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId, reportId) => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }

        setActioningId(reportId);
        try {
            const response = await makeRequest(GRAPHQL_MUTATIONS.DELETE_REPORTED_POST, {
                postId
            });

            if (!response.errors) {
                showToast("Post deleted successfully", "success");
                setReports(reports.filter(r => r.id !== reportId));
            } else {
                const errorMessage = response.errors[0]?.message || "Failed to delete post";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            showToast("An error occurred while deleting the post", "error");
        } finally {
            setActioningId(null);
        }
    };

    const handleDiscardReport = async (reportId) => {
        setActioningId(reportId);
        try {
            const response = await makeRequest(GRAPHQL_MUTATIONS.DISCARD_REPORT, {
                reportId
            });

            if (!response.errors) {
                showToast("Report discarded successfully", "success");
                setReports(reports.filter(r => r.id !== reportId));
            } else {
                const errorMessage = response.errors[0]?.message || "Failed to discard report";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error discarding report:", error);
            showToast("An error occurred while discarding the report", "error");
        } finally {
            setActioningId(null);
        }
    };

    if (!isModerator) {
        return null;
    }

    return (
        <div className="page-layout">
            <Navbar />
            <div className="page-content">
                <Sidebar />
                <main className="rpp-page">
                    <div className="rpp-header">
                        <button className="rpp-back-button" onClick={() => navigate(-1)}>
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </button>
                        <div className="rpp-header-title">
                            <ShieldAlert size={28} className="rpp-header-icon" />
                            <h1>Reported Posts</h1>
                        </div>
                        <p className="rpp-header-subtitle">
                            Review and manage posts that have been reported by users
                        </p>
                    </div>

                    {loading ? (
                        <div className="rpp-loading-state">
                            <div className="rpp-spinner"></div>
                            <p>Loading reported posts...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="rpp-empty-state">
                            <div className="rpp-empty-icon">
                                <ShieldAlert size={64} strokeWidth={1.5} />
                            </div>
                            <h2>No reported posts</h2>
                            <p className="rpp-empty-description">
                                There are no active reports at this time. When users report inappropriate content,
                                it will appear here for moderation.
                            </p>
                            <div className="rpp-info-box">
                                <AlertTriangle size={18} />
                                <span>Keep the community safe by reviewing reports promptly</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="rpp-reports-count">
                                <span>{reports.length} {reports.length === 1 ? 'report' : 'reports'} pending</span>
                            </div>
                            <div className="rpp-reports-grid">
                                {reports.map((report) => (
                                    <div key={report.id} className="rpp-report-card">
                                        <div className="rpp-report-header-info">
                                            <div className="rpp-reporter-info">
                                                <img
                                                    src={
                                                        report.reportedByUser?.profilePic ||
                                                        `https://api.dicebear.com/9.x/identicon/svg?seed=${report.reportedByUser?.nickname}`
                                                    }
                                                    alt={report.reportedByUser?.nickname}
                                                    className="rpp-reporter-avatar"
                                                />
                                                <div>
                                                    <p className="rpp-reported-by">
                                                        Reported by <strong>{report.reportedByUser?.nickname}</strong>
                                                    </p>
                                                    <p className="rpp-report-date">{formatTime(report.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="rpp-report-badge">
                                                <AlertTriangle size={16} />
                                            </div>
                                        </div>

                                        <div className="rpp-report-reason">
                                            <strong>Reason:</strong>
                                            <p>{report.reason}</p>
                                        </div>

                                        <div className="rpp-reported-post-preview">
                                            <div className="rpp-post-author">
                                                <img
                                                    src={
                                                        report.post?.user?.profilePic ||
                                                        `https://api.dicebear.com/9.x/identicon/svg?seed=${report.post?.user?.nickname}`
                                                    }
                                                    alt={report.post?.user?.nickname}
                                                    className="rpp-post-author-avatar"
                                                />
                                                <div>
                                                    <p className="rpp-author-name">
                                                        {report.post?.user?.nickname || report.post?.user?.name}
                                                    </p>
                                                    <p className="rpp-post-date">{formatTime(report.post?.created)}</p>
                                                </div>
                                            </div>

                                            <div className="rpp-post-content-preview">
                                                {report.post?.title && <h4>{report.post.title}</h4>}
                                                <p>{report.post?.content}</p>
                                                {report.post?.imageUrl && (
                                                    <img
                                                        src={report.post.imageUrl}
                                                        alt="Post"
                                                        className="rpp-post-preview-image"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="rpp-report-actions">
                                            <button
                                                className={`rpp-action-btn rpp-discard-btn ${actioningId === report.id ? 'loading' : ''}`}
                                                onClick={() => handleDiscardReport(report.id)}
                                                disabled={actioningId === report.id}
                                            >
                                                {actioningId === report.id ? (
                                                    <span className="rpp-button-spinner"></span>
                                                ) : (
                                                    <>
                                                        <XCircle size={18} />
                                                        <span>Discard</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className={`rpp-action-btn rpp-delete-btn ${actioningId === report.id ? 'loading' : ''}`}
                                                onClick={() => handleDeletePost(report.postId, report.id)}
                                                disabled={actioningId === report.id}
                                            >
                                                {actioningId === report.id ? (
                                                    <span className="rpp-button-spinner"></span>
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
