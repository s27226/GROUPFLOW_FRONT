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
            comments: [{
                user: "Frank",
                time: "12h ago",
                text: "I feel this in my bones",
                likes: 3,
                liked: false,
                menuOpen: false,
                replies: [{
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }]
            },
                {
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }, {
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }]
        },
        {
            author: "John",
            time: "1d ago",
            content: "Man",
            comments: [
                {
                    user: "Alice",
                    time: "5h ago",
                    text: "Women",
                    likes: 2,
                    liked: false,
                    menuOpen: false,
                    replies: [
                        {
                            user: "Bob",
                            time: "4h ago",
                            text: "Test",
                            likes: 1,
                            liked: false,
                            menuOpen: false,
                            replies: [
                                {
                                    user: "Charlie",
                                    time: "3h ago",
                                    text: "Fax machine noises",
                                    likes: 0,
                                    liked: false,
                                    menuOpen: false,
                                    replies: [
                                        {
                                            user: "Dave",
                                            time: "2h ago",
                                            text: "I must be the reason why, you have given up your smiles and the hope inside your eyes",
                                            likes: 0,
                                            liked: false,
                                            menuOpen: false,
                                            replies: [
                                                {
                                                    user: "Eve",
                                                    time: "1h ago",
                                                    text: "Reply at depth 5 please dont im begging",
                                                    likes: 0,
                                                    liked: false,
                                                    menuOpen: false,
                                                    replies: []
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    user: "Frank",
                    time: "12h ago",
                    text: "I feel this in my bones",
                    likes: 3,
                    liked: false,
                    menuOpen: false,
                    replies: []
                }
            ]
        }
    ];

    return (
        <div className="feed-container">
            {posts.map((post, index) => (
                <Post key={index} {...post} />
            ))}
        </div>

    );
}
