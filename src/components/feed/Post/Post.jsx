import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "../../ui/LazyImage";
import "./Post.css";
import { MoreVertical, Heart, MessageCircle, Share2 } from "lucide-react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useAuthenticatedRequest } from "../../../hooks/useAuthenticatedRequest";
import { GRAPHQL_MUTATIONS, GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useAuth } from "../../../context/AuthContext";
import { formatTime } from "../../../utils/dateFormatter";
import { useToast } from "../../../context/ToastContext";
import { sanitizeText } from "../../../utils/sanitize";
import { usePostInteractions } from "../../../hooks/usePostInteractions";

export default function Post({
    id,
    author,
    authorId,
    authorProfilePic,
    time,
    content,
    image,
    comments: initialComments,
    saved: initialSaved = false,
    hidden: initialHidden = false,
    sharedPost = null,
    isFullView = false,
    likes: initialLikes = [],
    projectId = null,
    onHide,
    onUndoHide,
    onSave,
    onUpdate
}) {
    const navigate = useNavigate();
    const { makeRequest } = useAuthenticatedRequest();
    const { user } = useAuth();
    const { showToast } = useToast();
    const {
        likePost,
        unlikePost,
        addComment,
        savePost: savePostMutation,
        unsavePost: unsavePostMutation,
        canModifyPost
    } = usePostInteractions();
    
    const [likes, setLikes] = useState(initialLikes || []);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState(initialComments || []);
    const [commentInput, setCommentInput] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [saved, setSaved] = useState(initialSaved);
    const [showHideToast, setShowHideToast] = useState(false);
    const [showComments, setShowComments] = useState(isFullView);
    const [isFriend, setIsFriend] = useState(false);
    const [checkingFriendship, setCheckingFriendship] = useState(true);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const menuRef = useClickOutside(() => setMenuOpen(false), menuOpen);

    // Check if current user has liked the post
    useEffect(() => {
        if (user && likes) {
            const hasLiked = likes.some(like => like.userId === user.id);
            setLiked(hasLiked);
        }
    }, [likes, user]);

    // Check friendship status
    useEffect(() => {
        const checkFriendship = async () => {
            if (!authorId || !user || authorId === user.id) {
                setCheckingFriendship(false);
                setIsFriend(false);
                return;
            }

            try {
                const response = await makeRequest(GRAPHQL_QUERIES.GET_FRIENDSHIP_STATUS, {
                    friendId: authorId
                });

                if (!response.errors && response.data?.friendship?.friendshipstatus) {
                    setIsFriend(response.data.friendship.friendshipstatus === "friends");
                }
            } catch (error) {
                console.error("Error checking friendship status:", error);
            } finally {
                setCheckingFriendship(false);
            }
        };

        checkFriendship();
    }, [authorId, user, makeRequest]);

    const countComments = (comments) => {
        if (!comments || comments.length === 0) return 0;
        return comments.reduce((acc, c) => acc + 1 + countComments(c.replies || []), 0);
    };

    const handleBlockUser = async () => {
        if (!authorId) return;

        try {
            const response = await makeRequest(GRAPHQL_MUTATIONS.BLOCK_USER, {
                userIdToBlock: authorId
            });

            if (!response.errors) {
                showToast(`You have blocked ${author}. You will no longer see their posts.`, "success");
                setMenuOpen(false);
                
                if (onUpdate) {
                    onUpdate();
                }
                
                window.location.reload();
            } else {
                const errorMessage = response.errors[0]?.message || "Failed to block user";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error blocking user:", error);
            showToast("An error occurred while blocking the user", "error");
        }
    };

    const handleLikeToggle = async () => {
        try {
            if (liked) {
                await unlikePost(id, (updatedLikes) => setLikes(updatedLikes));
                setLiked(false);
            } else {
                await likePost(id, (newLike) => {
                    setLikes([...likes, newLike]);
                    setLiked(true);
                });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const submitComment = async () => {
        if (!commentInput.trim()) return;

        try {
            const newComment = await addComment(id, commentInput, null);
            
            if (newComment) {
                const commentData = {
                    id: newComment.id,
                    user: newComment.user.nickname || `${newComment.user.name} ${newComment.user.surname}`,
                    userId: newComment.userId,
                    time: formatTime(newComment.createdAt),
                    text: newComment.content,
                    likes: [],
                    liked: false,
                    menuOpen: false,
                    replies: []
                };
                
                setComments(prevComments => [...prevComments, commentData]);
                setCommentInput("");
                
                if (!showComments) {
                    setShowComments(true);
                }
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleSavePost = async () => {
        try {
            if (saved) {
                await unsavePostMutation(id);
            } else {
                await savePostMutation(id);
            }
            setSaved(!saved);
            if (onSave) onSave(id);
            setMenuOpen(false);
        } catch (error) {
            console.error("Error saving/unsaving post:", error);
            showToast("Failed to update saved status", "error");
        }
    };

    const handleShare = () => {
        const postData = encodeURIComponent(
            JSON.stringify({
                id,
                author,
                authorId,
                authorProfilePic,
                time,
                content,
                image
            })
        );
        const shareUrl = projectId 
            ? `/project/${projectId}/new-post?share=${postData}`
            : `/new-post?share=${postData}`;
        navigate(shareUrl);
    };

    const handleReportPost = async () => {
        if (!reportReason.trim()) {
            showToast("Please provide a reason for reporting this post", "error");
            return;
        }

        try {
            const response = await makeRequest(GRAPHQL_MUTATIONS.REPORT_POST, {
                input: {
                    postId: id,
                    reason: reportReason
                }
            });

            if (!response.errors) {
                showToast("Post reported successfully. Thank you for helping keep our community safe.", "success");
                setShowReportDialog(false);
                setReportReason("");
                setMenuOpen(false);
            } else {
                const errorMessage = response.errors[0]?.message || "Failed to report post";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error reporting post:", error);
            showToast("An error occurred while reporting the post", "error");
        }
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <img
                    src={authorProfilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${author}`}
                    alt={author}
                    className="post-avatar"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (authorId) navigate(`/profile/${authorId}`);
                    }}
                />

                <div className="author-time">
                    <span
                        className="post-author"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (authorId) navigate(`/profile/${authorId}`);
                        }}
                    >
                        {author}
                    </span>
                    <span className="post-time">· {time}</span>
                </div>

                <div className="post-dots" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        <MoreVertical size={20} />
                    </button>

                    {menuOpen && (
                        <div className="post-dropdown-menu">
                            <button onClick={handleSavePost}>
                                {saved ? "Unsave Post" : "Save Post"}
                            </button>
                            {!isFriend && authorId && authorId !== user?.id && (
                                <button onClick={handleBlockUser}>Block User</button>
                            )}
                            {authorId !== user?.id && (
                                <button onClick={() => {
                                    setShowReportDialog(true);
                                    setMenuOpen(false);
                                }}>
                                    Report
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div
                className="post-content"
                style={{ cursor: isFullView ? "default" : "pointer" }}
                onClick={() => !isFullView && navigate(`/post/${id}`)}
            >
                <p>{sanitizeText(content)}</p>
                {image && (
                    <LazyImage src={image} alt="post" className="post-image" aspectRatio={16 / 9} />
                )}

                {sharedPost && (
                    <div className="post-shared-preview">
                        <div className="post-shared-header">
                            <span>Shared post from {sharedPost.author}</span>
                        </div>
                        <div className="post-shared-content">
                            <div className="post-shared-info">
                                <img
                                    src={sharedPost.authorProfilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${sharedPost.author}`}
                                    alt={sharedPost.author}
                                    className="post-shared-avatar"
                                />
                                <div>
                                    <strong
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (sharedPost.userId) navigate(`/profile/${sharedPost.userId}`);
                                        }}
                                    >
                                        {sharedPost.author}
                                    </strong>
                                    <span> · {sharedPost.time}</span>
                                </div>
                            </div>
                            <p className="post-shared-text">{sanitizeText(sharedPost.content)}</p>
                            {sharedPost.image && (
                                <LazyImage
                                    src={sharedPost.image}
                                    alt="shared"
                                    className="post-shared-image"
                                    aspectRatio={16 / 9}
                                />
                            )}
                            <a
                                href={`/post/${sharedPost.id}`}
                                className="post-shared-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/post/${sharedPost.id}`);
                                }}
                            >
                                View original post
                            </a>
                        </div>
                    </div>
                )}
            </div>

            <div className="post-actions">
                <button
                    className="icon-btn"
                    onClick={handleLikeToggle}
                >
                    <Heart
                        size={20}
                        fill={liked ? "var(--accent)" : "none"}
                        stroke={liked ? "var(--accent)" : "var(--text-secondary)"}
                    />
                    <span>{likes.length}</span>
                </button>

                <button
                    className="icon-btn"
                    onClick={() => !isFullView && setShowComments(!showComments)}
                    style={{ cursor: isFullView ? "default" : "pointer" }}
                >
                    <MessageCircle size={20} />
                    <span>{countComments(comments)}</span>
                </button>

                <button className="icon-btn" onClick={handleShare}>
                    <Share2 size={20} />
                </button>
            </div>

            {showComments && (
                <div className="comment-section">
                    <div className="comment-input-row">
                        <img
                            src={user?.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${user?.nickname || 'You'}`}
                            alt="You"
                            className="comment-avatar"
                        />
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submitComment()}
                        />
                        <button className="send-comment" onClick={submitComment}>
                            Post
                        </button>
                    </div>

                    {comments.map((c, i) => (
                        <Comment
                            key={c.id || i}
                            comment={c}
                            postId={id}
                            update={(newData) => {
                                setComments(prevComments => {
                                    const updated = [...prevComments];
                                    updated[i] = newData;
                                    return updated;
                                });
                            }}
                            onDelete={(commentId) => {
                                setComments(prevComments => prevComments.filter(c => c.id !== commentId));
                            }}
                        />
                    ))}
                </div>
            )}

            {showReportDialog && (
                <div className="report-dialog-overlay" onClick={() => setShowReportDialog(false)}>
                    <div className="report-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>Report Post</h3>
                        <p>Please tell us why you're reporting this post:</p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Enter your reason here..."
                            rows={4}
                        />
                        <div className="report-dialog-actions">
                            <button 
                                className="btn-cancel" 
                                onClick={() => {
                                    setShowReportDialog(false);
                                    setReportReason("");
                                }}
                            >
                                Cancel
                            </button>
                            <button className="btn-report" onClick={handleReportPost}>
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

function Comment({ comment, update, depth = 0, postId, onDelete }) {
    const maxDepth = 4;
    const safeDepth = Math.min(depth, maxDepth);
    const leftMargin = safeDepth * 20;
    const { makeRequest } = useAuthenticatedRequest();
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        likeComment,
        unlikeComment,
        addComment: replyToComment,
        deleteComment,
        canModifyComment
    } = usePostInteractions();

    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [collapsed, setCollapsed] = useState((comment.replies?.length || 0) >= 2);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(comment.likes || []);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const menuRef = useClickOutside(() => setMenuOpen(false), menuOpen);

    // Check if current user has liked the comment
    useEffect(() => {
        if (user && likes) {
            const hasLiked = Array.isArray(likes) ? likes.some(like => like.userId === user.id) : false;
            setLiked(hasLiked);
        }
    }, [likes, user]);

    const toggleLike = async () => {
        if (!comment.id) return;
        
        try {
            if (liked) {
                await unlikeComment(comment.id, (updatedLikes) => {
                    setLikes(updatedLikes);
                    setLiked(false);
                    update({ ...comment, likes: updatedLikes });
                });
            } else {
                await likeComment(comment.id, (newLike) => {
                    const newLikes = Array.isArray(likes) ? [...likes, newLike] : [newLike];
                    setLikes(newLikes);
                    setLiked(true);
                    update({ ...comment, likes: newLikes });
                });
            }
        } catch (error) {
            console.error("Error toggling comment like:", error);
        }
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleDeleteComment = async () => {
        if (!comment.id) return;

        try {
            await deleteComment(comment.id);
            if (onDelete) {
                onDelete(comment.id);
            }
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(true);
        setMenuOpen(false);
    };

    const submitReply = async () => {
        if (!replyText.trim()) return;

        try {
            const newReply = await replyToComment(postId, replyText, comment.id);
            
            if (newReply) {
                const replyData = {
                    id: newReply.id,
                    user: newReply.user.nickname || `${newReply.user.name} ${newReply.user.surname}`,
                    userId: newReply.userId,
                    time: formatTime(newReply.createdAt),
                    text: newReply.content,
                    likes: [],
                    liked: false,
                    menuOpen: false,
                    replies: []
                };

                update({
                    ...comment,
                    replies: [...(comment.replies || []), replyData]
                });

                setReplyText("");
                setReplyOpen(false);
                setCollapsed(false);
            }
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    const updateReply = (index, newData) => {
        const updated = [...(comment.replies || [])];
        updated[index] = newData;
        update({ ...comment, replies: updated });
    };

    const deleteReply = (replyId) => {
        const updated = (comment.replies || []).filter(reply => reply.id !== replyId);
        update({ ...comment, replies: updated });
    };

    return (
        <div className="comment" style={{ marginLeft: `${leftMargin}px` }}>
            <div className="comment-header">
                <img
                    src={comment.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${comment.user}`}
                    alt={comment.user}
                    className="comment-avatar"
                />

                <div className="comment-info">
                    <span 
                        className="comment-user"
                        style={{ cursor: "pointer" }}
                        onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}
                    >
                        {comment.user}
                    </span>
                    <span className="comment-time">· {comment.time}</span>
                </div>

                <div className="comment-dots" ref={menuRef}>
                    <button onClick={toggleMenu}>
                        <MoreVertical size={16} />
                    </button>

                    {menuOpen && (
                        <div className="comment-dropdown-menu">
                            <button onClick={confirmDelete}>Delete</button>
                            <button onClick={() => setMenuOpen(false)}>Report</button>
                        </div>
                    )}
                </div>
            </div>

            <p className="comment-text">{sanitizeText(comment.text)}</p>

            {showDeleteConfirm && (
                <div className="comment-delete-confirm">
                    <p>Delete this comment? All replies will be deleted too.</p>
                    <div className="comment-delete-actions">
                        <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </button>
                        <button className="btn-delete" onClick={handleDeleteComment}>
                            Delete
                        </button>
                    </div>
                </div>
            )}

            <div className="comment-actions">
                <button className="icon-btn" onClick={toggleLike}>
                    <Heart
                        size={16}
                        fill={liked ? "var(--accent)" : "none"}
                        stroke={liked ? "var(--accent)" : "var(--text-secondary)"}
                    />
                    <span>{Array.isArray(likes) ? likes.length : 0}</span>
                </button>

                <button className="reply-btn" onClick={() => setReplyOpen(!replyOpen)}>
                    Reply
                </button>

                {(comment.replies?.length || 0) > 0 && (
                    <button className="reply-btn" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? `View replies (${comment.replies.length})` : "Hide replies"}
                    </button>
                )}
            </div>

            {replyOpen && (
                <div className="reply-input-row">
                    <img
                        src={user?.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${user?.nickname || 'You'}`}
                        alt="You"
                        className="comment-avatar"
                    />
                    <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitReply()}
                    />
                    <button className="send-comment" onClick={submitReply}>
                        Reply
                    </button>
                </div>
            )}

            {!collapsed && comment.replies?.length > 0 && (
                <div className="reply-list">
                    {comment.replies.map((reply, i) => (
                        <Comment
                            key={reply.id || i}
                            comment={reply}
                            postId={postId}
                            update={(newData) => updateReply(i, newData)}
                            onDelete={deleteReply}
                            depth={safeDepth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
