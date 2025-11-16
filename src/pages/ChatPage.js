import React, {useState} from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";

import "../styles/MainComponents.css";
import "../styles/Chat.css"


export default function ChatPage() {
    const [selectedUser, setSelectedUser] = useState(null);

    const users = [
        { id: 1, name: "Jan Kowalski", online: true },
        { id: 2, name: "Kasia Nowak", online: false },
        { id: 3, name: "Piotr Zieliński", online: true },
    ];



    return (
        <div className="main-layout">
            <Navbar />
            <div className="main-content">
                <Sidebar />
                <div className="center-wrapper">
                    <div className="feed-wrapper">

                        <div className="chat-layout">
                            {/* Lista użytkowników */}
                            <ChatList users={users} onSelectUser={setSelectedUser} selectedUser={selectedUser}/>

                            {/* Okno rozmowy */}
                            <div className="chat-window-wrapper">
                                {selectedUser ? (
                                    <ChatWindow user={selectedUser}/>
                                ) : (
                                    <div className="chat-placeholder">
                                        <p>💬 Wybierz osobę, aby rozpocząć rozmowę</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}