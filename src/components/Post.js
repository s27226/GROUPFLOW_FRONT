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
                <div>
                    <h3 className="post-author">{author}</h3>
                    <p className="post-time">{time}</p>
                </div>
            </div>

            <div className="post-content">
                <p>{content}</p>
                {image && <img src={image} alt="post" className="post-image" />}
            </div>

            <div className="post-actions">
                <button className="like-btn"> Like</button>
                <button className="comment-btn"> Comment</button>
                <button className="share-btn"> share</button>
            </div>
        </div>
    );
}
