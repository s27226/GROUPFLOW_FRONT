import React, { useState } from "react";
import "../styles/feed.css";
import { MoreVertical, Heart, MessageCircle, Share2 } from "lucide-react";

export default function Post({ 
    id,
    author, 
    time, 
    content, 
    image, 
    comments: initialComments,
    saved: initialSaved = false,
    hidden: initialHidden = false,
    onHide,
    onUndoHide,
    onSave
}) {
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState(initialComments || []);
    const [commentInput, setCommentInput] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [saved, setSaved] = useState(initialSaved);
    const [showHideToast, setShowHideToast] = useState(false);

    const [showComments, setShowComments] = useState(false);

    const countComments = (comments) => {
        if (!comments || comments.length === 0) return 0;
        return comments.reduce(
            (acc, c) => acc + 1 + countComments(c.replies),
            0
        );
    };
    const toggleLike = () => {
        if (liked) setLikes(likes - 1);
        else setLikes(likes + 1);

        setLiked(!liked);
    };

    const submitComment = () => {
        if (!commentInput.trim()) return;

        setComments([
            ...comments,
            {
                user: "You",
                time: "just now",
                text: commentInput,
                likes: 0,
                liked: false,
                menuOpen: false
            },
        ]);

        setCommentInput("");
    };

    const handleSavePost = () => {
        setSaved(!saved);
        if (onSave) onSave(id);
        setMenuOpen(false);
    };

    const handleHidePost = () => {
        if (onHide) onHide(id);
        setShowHideToast(true);
        setMenuOpen(false);
        setTimeout(() => setShowHideToast(false), 5000);
    };

    const handleUndoHide = () => {
        if (onUndoHide) onUndoHide(id);
        setShowHideToast(false);
    };

    return (
        <div className="post-card">
            {/* HEADER */}
            <div className="post-header">
                <img
                    src={`https://api.dicebear.com/9.x/identicon/svg?seed=${author}`}
                    alt={author}
                    className="post-avatar"
                />

                <div className="author-time">
                    <span className="post-author">{author}</span>
                    <span className="post-time">· {time}</span>
                </div>

                <div className="post-dots">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        <MoreVertical size={20}/>
                    </button>

                    {menuOpen && (
                        <div className="post-dropdown-menu">
                            <button onClick={handleSavePost}>
                                {saved ? "Unsave Post" : "Save Post"}
                            </button>
                            <button onClick={handleHidePost}>Hide Post</button>
                            <button>Block User</button>
                            <button>Report</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="post-content">
                <p>{content}</p>
                {image && <img src={image} alt="post" className="post-image"/>}
            </div>

            <div className="post-actions">
                <button
                    className="icon-btn"
                    onClick={() =>
                        setLikes(likes === 0 ? 1 : 0)
                    }
                >
                    <Heart
                        size={20}
                        fill={likes ? "var(--accent)" : "none"}
                        stroke={likes ? "var(--accent)" : "var(--text-secondary)"}
                    />
                    <span>{likes}</span>
                </button>

                <button
                    className="icon-btn"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle size={20}/>
                    <span>{countComments(comments)}</span>
                </button>

                <button className="icon-btn">
                    <Share2 size={20}/>
                </button>
            </div>


            {showComments && (
                <div className="comment-section">

                    <div className="comment-input-row">
                        <img
                            src={`https://api.dicebear.com/9.x/identicon/svg?seed=You`}
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
                        <button className="send-comment" onClick={submitComment}>Post</button>
                    </div>

                    {comments.map((c, i) => (
                        <Comment
                            key={i}
                            comment={c}
                            update={(newData) => {
                                const updated = [...comments];
                                updated[i] = newData;
                                setComments(updated);
                            }}
                        />
                    ))}
                </div>
            )}

            {showHideToast && (
                <div className="hide-toast">
                    <span>Post hidden</span>
                    <button onClick={handleUndoHide} className="undo-btn">
                        Undo
                    </button>
                </div>
            )}
        </div>
    );
}

function Comment({comment, update, depth = 0}) {
    const maxDepth = 4;
    const safeDepth = Math.min(depth, maxDepth);
    const leftMargin = safeDepth * 20; // limit indent

    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");

    const [collapsed, setCollapsed] = useState(
        (comment.replies?.length || 0) >= 2
    );

    const toggleLike = () =>
        update({
            ...comment,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            liked: !comment.liked
        });

    const toggleMenu = () =>
        update({...comment, menuOpen: !comment.menuOpen});

    const submitReply = () => {
        if (!replyText.trim()) return;

        const newReply = {
            user: "You",
            time: "just now",
            text: replyText,
            likes: 0,
            liked: false,
            menuOpen: false,
            replies: []
        };

        update({
            ...comment,
            replies: [...(comment.replies || []), newReply]
        });

        setReplyText("");
        setReplyOpen(false);
        setCollapsed(false);
    };

    const updateReply = (index, newData) => {
        const updated = [...comment.replies];
        updated[index] = newData;
        update({ ...comment, replies: updated });
    };

    return (
        <div className="comment" style={{ marginLeft: `${leftMargin}px` }}>

            {/* HEADER */}
            <div className="comment-header">
                <img
                    src={`https://api.dicebear.com/9.x/identicon/svg?seed=${comment.user}`}
                    alt={comment.user}
                    className="comment-avatar"
                />

                <div className="comment-info">
                    <span className="comment-user">{comment.user}</span>
                    <span className="comment-time">· {comment.time}</span>
                </div>

                <div className="comment-dots">
                    <button onClick={toggleMenu}>
                        <MoreVertical size={16} />
                    </button>

                    {comment.menuOpen && (
                        <div className="comment-dropdown-menu">
                            <button>Delete</button>
                            <button>Report</button>
                        </div>
                    )}
                </div>
            </div>

            <p className="comment-text">{comment.text}</p>

            <div className="comment-actions">
                <button className="icon-btn" onClick={toggleLike}>
                    <Heart
                        size={16}
                        fill={comment.liked ? "var(--accent)" : "none"}
                        stroke={comment.liked ? "var(--accent)" : "var(--text-secondary)"}
                    />
                    <span>{comment.likes}</span>
                </button>

                <button className="reply-btn" onClick={() => setReplyOpen(!replyOpen)}>
                    Reply
                </button>

                {(comment.replies?.length || 0) > 0 && (
                    <button className="reply-btn" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed
                            ? `View replies (${comment.replies.length})`
                            : "Hide replies"}
                    </button>
                )}
            </div>

            {replyOpen && (
                <div className="reply-input-row">
                    <img
                        src={`https://api.dicebear.com/9.x/identicon/svg?seed=You`}
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
                    <button className="send-comment" onClick={submitReply}>Reply</button>
                </div>
            )}

            {!collapsed && comment.replies?.length > 0 && (
                <div className="reply-list">
                    {comment.replies.map((reply, i) => (
                        <Comment
                            key={i}
                            comment={reply}
                            update={(newData) => updateReply(i, newData)}
                            depth={safeDepth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
