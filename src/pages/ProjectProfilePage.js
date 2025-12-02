import React from "react";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import "../styles/ProfilePage.css";
import "../styles/feed.css";
import { useNavigate } from "react-router-dom";
import shrimp from "../images/shrimp.png";

export default function ProjectProfilePage() {
    const navigate = useNavigate();

    const members = [
        {
            name: "John",
            role: "Lead Developer",
            image: "https://api.dicebear.com/9.x/identicon/svg?seed=ShrimpDev",
        },
        {
            name: "Alice",
            role: "Designer",
            image: "https://picsum.photos/60?random=2",
        },
    ];

    const project = {
        name: "Shrimp Tracker",
        description: "A small app",
        banner: "https://picsum.photos/900/200?random=10",
        image: shrimp,
        members: members,
    };

    const posts = [
        {
            id: 1,
            author: "John",
            time: "2h ago",
            content: "im putting whatever here",
            image: "https://picsum.photos/600/300?random=15",
            saved: false,
            sharedPost: null,
            comments: [],
            likes: 18,
        },
        {
            id: 2,
            author: "Alice",
            time: "1d ago",
            content:
                "majority of these damn posts are generated anyway cuz i lack creativity",
            saved: false,
            sharedPost: null,
            comments: [],
            likes: 25,
        },
        {
            id: 3,
            author: "John",
            time: "3d ago",
            content: "Today is Today",
            image: "https://picsum.photos/600/300?random=20",
            saved: false,
            sharedPost: null,
            comments: [],
            likes: 9,
        },
    ];

    return (
        <div className="profile-layout">
            <Navbar />
            <div className="profile-content">
                <Sidebar />

                <div className="profile-main">
                    <div className="profile-banner">
                        <img src={project.banner} alt="Banner" />
                    </div>

                    <div className="profile-header">
                        <img src={project.image} alt="Project" className="profile-pfp" />
                        <div className="profile-info">
                            <h2>{project.name}</h2>
                            <button
                                className="edit-btn"
                                onClick={() => navigate("/project/edit")}
                            >
                                Edit Frontpage
                            </button>
                        </div>
                    </div>

                    <div className="profile-body">
                        <div className="profile-left">
                            <section className="about-me">
                                <h3>Description</h3>
                                <p>{project.description}</p>
                            </section>

                            <section className="owned-projects">
                                <h3>Members</h3>
                                <div className="profile-members-scroll">
                                    {project.members?.map((member, index) => (
                                        <div
                                            key={index}
                                            className="profile-member-card clickable"
                                            onClick={() =>
                                                navigate(`/profile`)
                                            }
                                        >
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="profile-member-pfp"
                                            />
                                            <p className="profile-member-name">{member.name}</p>
                                            <p className="profile-member-role">{member.role}</p>
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
                                            comments={post.comments}
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
            <button
                //todo
                className="create-post-btn"
                onClick={() => navigate("/project/new-post")}
            >
                <Plus size={26} />
            </button>
        </div>
    );
}
