import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import "../styles/ProfilePage.css";
import "../styles/feed.css";
import { useNavigate } from "react-router-dom";
import shrimp from "../images/shrimp.png";

export default function ProfilePage() {
    const projects = [
        {
            name: "Shrimp Tracker",
            description: "A small app to track your shrimp collection",
            image: shrimp,
        },
        {
            name: "Task Manager 2",
            description: "Some more hardcoded posts for designing stuff",
            image: "https://picsum.photos/60?random=2",
        },
    ];

    const user = {
        name: "John",
        handle: "@John",
        bio: "Professional homeless man",
        banner: "https://picsum.photos/900/200?random=10",
        pfp: "https://api.dicebear.com/9.x/identicon/svg?seed=ShrimpDev",
        abt:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor\n" +
            "                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        projects: projects,
    };

    const navigate = useNavigate();

    const posts = [
        {
            id: 1,
            author: "John",
            time: "2h ago",
            content: "Today is friday",
            image: "https://picsum.photos/600/300?random=15",
            saved: false,
            sharedPost: null,
            likes: 12,
        },
        {
            id: 2,
            author: "John",
            time: "1d ago",
            content: "Man",
            saved: false,
            sharedPost: null,
            likes: 34,
            comments: [
                {
                    user: "Alice",
                    time: "5h ago",
                    text: "Lmao fr",
                    likes: 2,
                    liked: false,
                    menuOpen: false,
                    replies: [
                        {
                            user: "Bob",
                            time: "4h ago",
                            text: "Nah cause he's right",
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
                                            text: "This thread goes hard",
                                            likes: 0,
                                            liked: false,
                                            menuOpen: false,
                                            replies: [
                                                {
                                                    user: "Eve",
                                                    time: "1h ago",
                                                    text: "Reply at depth 5 (should stop indenting further!)",
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
        },
        {
            id: 3,
            author: "John",
            time: "3d ago",
            content: "React",
            image: "https://picsum.photos/600/300?random=20",
            saved: false,
            sharedPost: null,
            likes: 7,
        },
    ];

    return (
        <div className="profile-layout">
            <Navbar />
            <div className="profile-content">
                <Sidebar />

                <div className="profile-main">
                    <div className="profile-banner">
                        <img src={user.banner} alt="Banner" />
                    </div>

                    <div className="profile-header">
                        <img src={user.pfp} alt="Profile" className="profile-pfp" />
                        <div className="profile-info">
                            <h2>{user.name}</h2>
                            <p className="username">{user.handle}</p>
                            <p className="bio">{user.bio}</p>
                            <button
                                className="edit-btn"
                                onClick={() => navigate("/profile/edit")}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="profile-body">
                        <div className="profile-left">
                            <section className="about-me">
                                <h3>About Me</h3>
                                <p>Local man</p>
                                <p>{user.abt}</p>
                            </section>

                            <section className="owned-projects">
                                <h3>Part of projects</h3>
                                <div className="projects-scroll">
                                    {user.projects?.map((proj, index) => (
                                        <div
                                            key={index}
                                            className="project-card clickable"
                                            onClick={() =>
                                                navigate(`/project`)
                                            }
                                        >
                                            <img src={proj.image} alt={proj.name} />
                                            <p>{proj.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="profile-right">
                            <div className="profile-posts">
                                <h3>Activity</h3>
                                <div className="feed-container">
                                    {posts.map((post, index) => (
                                        <Post
                                            key={post.id}
                                            id={post.id}
                                            author={post.author}
                                            time={post.time}
                                            content={post.content}
                                            image={post.image}
                                            comments={post.comments || []}
                                            saved={post.saved}
                                            sharedPost={post.sharedPost}
                                            likes={post.likes}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
