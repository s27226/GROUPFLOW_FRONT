import React, {useState} from "react";
import "../styles/Users.css";




import User from "./User";

export default function Users() {



    const [Friends, setFriends] = useState([
        { id: 1, name: "Jan Kowalski", status: "available",avatar: "https://i.pravatar.cc/40?img=3", },
        { id: 2, name: "Kasia Nowak", status: "away",avatar: "https://i.pravatar.cc/40?img=3", },
        { id: 3, name: "Piotr Zieliński", status: "offline",avatar: "https://i.pravatar.cc/40?img=3", },

    ]);

    const removeFriend = (id) => {
        const updated = Friends.filter(friend => friend.id !== id);

        setFriends(updated);
    };



    const searchQuery = localStorage.getItem("searchQuery") || "";
    console.log(searchQuery);
    const cleanedQuery = searchQuery.toLowerCase().trim().slice(1,-1);
    console.log(cleanedQuery);
    const users = cleanedQuery === ""
        ? Friends
        : Friends.filter(group =>
            group?.name?.toLowerCase().includes(cleanedQuery)

        );



    return (
        <div className="users-container">

            {Friends.length === 0 ? (
                <p>No friends yet. ];</p>
            )  : (
                <ul>
                    {users.map((post, index) => (
                        <div className="user-row" key={index}>
                            <User key={index} {...post} />
                            {Friends.includes(post.id) ? (
                                <span className="added-text">usuwanie</span>
                            ) : (
                                <button
                                    className="add-btn"
                                    onClick={() => removeFriend(post.id)}
                                >
                                    Remove from firends
                                </button>
                            )}
                        </div>
                    ))}

                </ul>
            )}

        </div>
    );
}