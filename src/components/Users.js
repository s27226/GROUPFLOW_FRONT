import React, {useState} from "react";
import "../styles/Users.css";


import User from "./User";

export default function Users() {
    let baseUsers = [
        {id: 1, name: "Jan Kowalski", status: "available", avatar: "https://i.pravatar.cc/40?img=3",},
        {id: 2, name: "Kasia Nowak", status: "away", avatar: "https://i.pravatar.cc/40?img=3",},
        {id: 3, name: "Piotr Zieliński", status: "offline", avatar: "https://i.pravatar.cc/40?img=3",},
    ];


    const [addedFriends, setAddedFriends] = useState([]);

    const handleAddFriend = (id) => {
        setAddedFriends((prev) => [...prev, id]);
    };


    const searchQuery = localStorage.getItem("searchQuery") || "";
    console.log(searchQuery);
    const cleanedQuery = searchQuery.toLowerCase().trim().slice(1, -1);
    console.log(cleanedQuery);
    const users = cleanedQuery === ""
        ? {}
        : baseUsers.filter(group =>
            group?.name?.toLowerCase().includes(cleanedQuery)
        );


    return (
        <div className="users-container">

            {/* Jeśli nic nie wpisano → pokaż tekst "nic" */}
            {cleanedQuery.trim() === "" ? (
                <p className="empty-text">Search for Friend</p>
            ) : (
                <ul>
                    {users.map((post, index) => (
                        <div className="user-row" key={index}>
                            <User key={index} {...post} />
                            {addedFriends.includes(index) ? (
                                <span className="added-text">już dodany</span>
                            ) : (
                                <button
                                    className="add-btn"
                                    onClick={() => handleAddFriend(index)}
                                >
                                    add to friends
                                </button>
                            )}
                        </div>
                    ))}

                </ul>
            )}

        </div>
    );
}