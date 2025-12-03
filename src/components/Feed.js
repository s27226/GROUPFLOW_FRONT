import React from "react";
import Post from "./Post";
import shrimp from "../images/shrimp.png"

export default function Feed() {
    let posts = [
        {
            author: "Alice",
            time: "2h ago",
            content: "hardcoded some test posts for viewing purposes (im gonna make the shrimp the coconut.png of our site)",
            image: shrimp,
        },
        {
            author: "Bob",
            time: "5h ago",
            content: "THE FUCKING TOP POSTS IMAGE REFUSES TO STAY IN BOUNDS UNLESS I FORCE PUSH IT DOWN WITH MARGIN-TOP CAN IT NOT",
            image: null,
        },
        {
            author: "Charlie",
            time: "1d ago",
            content: "We could use this page to leave each other comments when doing one anothers branches",
            image: "https://picsum.photos/600/300?random=2",
        },
    ];

    return (
        <div className="feed-container">
            {posts.map((post, index) => (
                <Post key={index} {...post} />
            ))}
        </div>
    );
}
