import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "../../ui/LazyImage";
import styles from "./Post.module.css";
import { MoreVertical, Heart, MessageCircle, Share2 } from "lucide-react";
import { useClickOutside, useAuthenticatedRequest, usePostInteractions } from "../../../hooks";
import { GRAPHQL_MUTATIONS, GRAPHQL_QUERIES } from "../../../queries/graphql";
import { useAuth } from "../../../context/AuthContext";
import { formatTime } from "../../../utils/dateFormatter";
import { useToast } from "../../../context/ToastContext";
import { sanitizeText } from "../../../utils/sanitize";
import type { Like, Post as PostType } from "../../../types";

interface CommentData {
    id: number;
    user?: string;
    userId: number;
    author?: string;
    authorProfilePic?: string;
    profilePic?: string;
    text?: string;
    content?: string;
    time: string;
    likes?: Like[];
    liked?: boolean;
    menuOpen?: boolean;
    replies?: CommentData[];
}

interface SharedPostData {
    id: number;
    author: string;
    authorId?: number;
    userId?: number;
    authorProfilePic?: string;
    time: string;
    content: string;
    image?: string;
}

interface PostProps {
    id: number;
    author: string;
    authorId: number;
    authorProfilePic?: string;
    time: string;
    content: string;
    image?: string;
    comments?: CommentData[];
    saved?: boolean;
    hidden?: boolean;
    sharedPost?: SharedPostData | null;
    isFullView?: boolean;
    likes?: Like[];
    projectId?: string | null;
    onHide?: () => void;
    onUndoHide?: () => void;
    onSave?: (postId: number) => void;
    onUpdate?: () => void;
}

export default function Post({
    id,
    author,
    authorId,
    authorProfilePic,
    time,
    content,
    image,
    comments: initialComments = [],
    saved: initialSaved = false,
    hidden: initialHidden = false,
    sharedPost = null,
    isFullView = false,
    likes: initialLikes = [],
    projectId = null,
    onHide = () => {},
    onUndoHide = () => {},
    onSave = (_postId: number) => {},
    onUpdate = () => {}
}: PostProps) {
    const navigate = useNavigate();
    const { makeRequest } = useAuthenticatedRequest();
    const { user } = useAuth();
    const { showToast } = useToast();
    const {
        likePost,
        unlikePost,
        addComment,
        savePost: savePostMutation,
        unsavePost: unsavePostMutation
    } = usePostInteractions();
    
    const [likes, setLikes] = useState<Like[]>(initialLikes || []);
    const [liked, setLiked] = useState<boolean>(false);
    const [comments, setComments] = useState<CommentData[]>(initialComments || []);
    const [commentInput, setCommentInput] = useState<string>("");
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(initialSaved);
    const [showHideToast, setShowHideToast] = useState<boolean>(false);
    const [showComments, setShowComments] = useState<boolean>(isFullView);
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [checkingFriendship, setCheckingFriendship] = useState<boolean>(true);
    const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
    const [reportReason, setReportReason] = useState<string>("");

    const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false), menuOpen);

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
                interface FriendshipResponse {
                    friendship?: {
                        friendshipstatus?: string;
                    };
                }
                const response = await makeRequest<FriendshipResponse>(GRAPHQL_QUERIES.GET_FRIENDSHIP_STATUS, {
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

    const countComments = (comments: CommentData[]): number => {
        if (!comments || comments.length === 0) return 0;
        return comments.reduce((acc: number, c: CommentData) => acc + 1 + countComments(c.replies || []), 0);
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
                await unlikePost(id);
                setLikes(prev => prev.filter(like => like.userId !== user?.id));
                setLiked(false);
            } else {
                const newLike = await likePost(id);
                if (newLike) {
                    setLikes(prev => [...prev, {
                        userId: newLike.userId,
                        userName: newLike.userName
                    }]);
                }
                setLiked(true);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const submitComment = async () => {
        if (!commentInput.trim()) return;

        try {
            const newComment = await addComment(id, commentInput, null);
            
            if (newComment && newComment.user) {
                const commentData: CommentData = {
                    id: newComment.id,
                    user: newComment.user.nickname || `${newComment.user.name || ''} ${newComment.user.surname || ''}`,
                    userId: newComment.userId,
                    time: formatTime(newComment.createdAt || null),
                    text: newComment.content,
                    likes: [],
                    liked: false,
                    menuOpen: false,
                    replies: []
                };
                
                setComments((prevComments: CommentData[]) => [...prevComments, commentData]);
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
        <div className={styles.postCard}>
            <div className={styles.postHeader}>
                <img
                    src={authorProfilePic}
                    alt={author}
                    className={styles.postAvatar}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (authorId) navigate(`/profile/${authorId}`);
                    }}
                />

                <div className={styles.authorTime}>
                    <span
                        className={styles.postAuthor}
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (authorId) navigate(`/profile/${authorId}`);
                        }}
                    >
                        {author}
                    </span>
                    <span className={styles.postTime}>· {time}</span>
                </div>

                <div className={styles.postDots} ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        <MoreVertical size={20} />
                    </button>

                    {menuOpen && (
                        <div className={styles.postDropdownMenu}>
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
                className={styles.postContent}
                style={{ cursor: isFullView ? "default" : "pointer" }}
                onClick={() => !isFullView && navigate(`/post/${id}`)}
            >
                <p>{sanitizeText(content)}</p>
                {image && (
                    <LazyImage src={image} alt="post" className={styles.postImage} aspectRatio={16 / 9} />
                )}

                {sharedPost && (
                    <div className={styles.postSharedPreview}>
                        <div className={styles.postSharedHeader}>
                            <span>Shared post from {sharedPost.author}</span>
                        </div>
                        <div className={styles.postSharedContent}>
                            <div className={styles.postSharedInfo}>
                                <img
                                    src={sharedPost.authorProfilePic}
                                    alt={sharedPost.author}
                                    className={styles.postSharedAvatar}
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
                            <p className={styles.postSharedText}>{sanitizeText(sharedPost.content)}</p>
                            {sharedPost.image && (
                                <LazyImage
                                    src={sharedPost.image}
                                    alt="shared"
                                    className={styles.postSharedImage}
                                    aspectRatio={16 / 9}
                                />
                            )}
                            <a
                                href={`/post/${sharedPost.id}`}
                                className={styles.postSharedLink}
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

            <div className={styles.postActions}>
                <button
                    className={styles.iconBtn}
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
                    className={styles.iconBtn}
                    onClick={() => !isFullView && setShowComments(!showComments)}
                    style={{ cursor: isFullView ? "default" : "pointer" }}
                >
                    <MessageCircle size={20} />
                    <span>{countComments(comments)}</span>
                </button>

                <button className={styles.iconBtn} onClick={handleShare}>
                    <Share2 size={20} />
                </button>
            </div>

            {showComments && (
                <div className={styles.commentSection}>
                    <div className={styles.commentInputRow}>
                        <img
                            src={user?.profilePicUrl || `https://api.dicebear.com/9.x/identicon/svg?seed=${user?.nickname || 'You'}`}
                            alt="You"
                            className={styles.commentAvatar}
                        />
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submitComment()}
                        />
                        <button className={styles.sendComment} onClick={submitComment}>
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
                <div className={styles.reportDialogOverlay} onClick={() => setShowReportDialog(false)}>
                    <div className={styles.reportDialog} onClick={(e) => e.stopPropagation()}>
                        <h3>Report Post</h3>
                        <p>Please tell us why you're reporting this post:</p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Enter your reason here..."
                            rows={4}
                        />
                        <div className={styles.reportDialogActions}>
                            <button 
                                className={styles.btnCancel} 
                                onClick={() => {
                                    setShowReportDialog(false);
                                    setReportReason("");
                                }}
                            >
                                Cancel
                            </button>
                            <button className={styles.btnReport} onClick={handleReportPost}>
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

interface CommentComponentProps {
    comment: CommentData;
    update: (newData: CommentData) => void;
    depth?: number;
    postId: number;
    onDelete: (commentId: number) => void;
}

function Comment({ comment, update, depth = 0, postId, onDelete }: CommentComponentProps) {
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
        deleteComment
    } = usePostInteractions();

    const [replyOpen, setReplyOpen] = useState<boolean>(false);
    const [replyText, setReplyText] = useState<string>("");
    const [collapsed, setCollapsed] = useState<boolean>((comment.replies?.length || 0) >= 2);
    const [liked, setLiked] = useState<boolean>(false);
    const [likes, setLikes] = useState<Like[]>(comment.likes || []);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

    const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false), menuOpen);

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
                await unlikeComment(comment.id);
                const updatedLikes = likes.filter(like => like.userId !== user?.id);
                setLikes(updatedLikes);
                setLiked(false);
                update({ ...comment, likes: updatedLikes });
            } else {
                const newLike = await likeComment(comment.id);
                if (newLike) {
                    const formattedLike: Like = {
                        userId: newLike.userId,
                        userName: newLike.userName
                    };
                    const newLikes = [...likes, formattedLike];
                    setLikes(newLikes);
                    setLiked(true);
                    update({ ...comment, likes: newLikes });
                }
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
            
            if (newReply && newReply.user) {
                const replyData: CommentData = {
                    id: newReply.id,
                    user: newReply.user.nickname || `${newReply.user.name || ''} ${newReply.user.surname || ''}`,
                    userId: newReply.userId,
                    time: formatTime(newReply.createdAt || null),
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

    const updateReply = (index: number, newData: CommentData) => {
        const updated = [...(comment.replies || [])];
        updated[index] = newData;
        update({ ...comment, replies: updated });
    };

    const deleteReply = (replyId: number) => {
        const updated = (comment.replies || []).filter(reply => reply.id !== replyId);
        update({ ...comment, replies: updated });
    };

    return (
        <div className={styles.comment} style={{ marginLeft: `${leftMargin}px` }}>
            <div className={styles.commentHeader}>
                <img
                    src={comment.profilePic}
                    alt={comment.user}
                    className={styles.commentAvatar}
                />

                <div className={styles.commentInfo}>
                    <span 
                        className={styles.commentUser}
                        style={{ cursor: "pointer" }}
                        onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}
                    >
                        {comment.user}
                    </span>
                    <span className={styles.commentTime}>· {comment.time}</span>
                </div>

                <div className={styles.commentDots} ref={menuRef}>
                    <button onClick={toggleMenu}>
                        <MoreVertical size={16} />
                    </button>

                    {menuOpen && (
                        <div className={styles.commentDropdownMenu}>
                            <button onClick={confirmDelete}>Delete</button>
                            <button onClick={() => setMenuOpen(false)}>Report</button>
                        </div>
                    )}
                </div>
            </div>

            <p className={styles.commentText}>{sanitizeText(comment.text)}</p>

            {showDeleteConfirm && (
                <div className={styles.commentDeleteConfirm}>
                    <p>Delete this comment? All replies will be deleted too.</p>
                    <div className={styles.commentDeleteActions}>
                        <button className={styles.btnCancel} onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </button>
                        <button className={styles.btnDelete} onClick={handleDeleteComment}>
                            Delete
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.commentActions}>
                <button className={styles.iconBtn} onClick={toggleLike}>
                    <Heart
                        size={16}
                        fill={liked ? "var(--accent)" : "none"}
                        stroke={liked ? "var(--accent)" : "var(--text-secondary)"}
                    />
                    <span>{Array.isArray(likes) ? likes.length : 0}</span>
                </button>

                <button className={styles.replyBtn} onClick={() => setReplyOpen(!replyOpen)}>
                    Reply
                </button>

                {(comment.replies?.length ?? 0) > 0 && (
                    <button className={styles.replyBtn} onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? `View replies (${comment.replies?.length ?? 0})` : "Hide replies"}
                    </button>
                )}
            </div>

            {replyOpen && (
                <div className={styles.replyInputRow}>
                    <img
                        src={user?.profilePicUrl || `https://api.dicebear.com/9.x/identicon/svg?seed=${user?.nickname || 'You'}`}
                        alt="You"
                        className={styles.commentAvatar}
                    />
                    <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitReply()}
                    />
                    <button className={styles.sendComment} onClick={submitReply}>
                        Reply
                    </button>
                </div>
            )}

            {!collapsed && (comment.replies?.length ?? 0) > 0 && (
                <div className={styles.replyList}>
                    {comment.replies?.map((reply, i) => (
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
