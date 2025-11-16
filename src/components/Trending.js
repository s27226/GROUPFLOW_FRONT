import React from "react";
import "../styles/Trending.css";

export default function Trending({ projects }) {
    return (
        <div className="trending-bar">
            <h3>Trending Projects</h3>
            <ul>
                {projects.map((project, index) => (
                    <li key={index} className="trending-card">
                        <img src={project.image} alt={project.name} className="trending-img"/>
                        <div className="trending-info">
                            <h4 className="trending-name">{project.name}</h4>
                            <p className="trending-desc">{project.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}