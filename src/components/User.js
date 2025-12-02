import React from "react";
import "../styles/User.css";


export default function User({id, avatar, name, status}) {


    return (
        <div
            key={id}
            className={`member-item ${status}`}

        >

            <div className="member-header">
                <img src={avatar} alt={name} className="member-avatar"/>


                <span className="member-name">{name}</span>
                <span className="status-text">
              {status === "available"
                  ? "Dostępny"
                  : status === "away"
                      ? "Za chwilę wracam"
                      : "Niedostępny"}
            </span>
            </div>

        </div>
    );
}