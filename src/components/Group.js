import React from "react";
import "../styles/Groups.css";
import {useNavigate} from "react-router-dom";

export default function Group({id, name, description}) {
    const navigate = useNavigate();


    return (
        <div className="group-card">
            <div className="group-header">

                <div onClick={() => {

                    navigate(`/project/chat`);

                }}>
                    <h3 className="group-name">
                        {name}

                    </h3>


                </div>
            </div>

            <div className="group-content">
                <p>{description}</p>

            </div>

            <div className="group-actions">
                <button className="like-btn"> Like</button>
                <button className="comment-btn"> Comment</button>
                <button className="share-btn"> share</button>
            </div>
        </div>
    );
}