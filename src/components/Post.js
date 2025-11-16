import React from "react";
import "../styles/feed.css";

export default function Post({ author, time, content, image }) {
    return (
        <div className="post-card">
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
            </div>

            <div className="post-content">
                <p>{content}</p>
                {image && <img src={image} alt="post" className="post-image" />}
            </div>

            <div className="post-actions">
                <button className="like-btn">Like</button>
                <button className="comment-btn">Comment</button>
                <button className="share-btn">Share</button>
            </div>
        </div>
    );
}
