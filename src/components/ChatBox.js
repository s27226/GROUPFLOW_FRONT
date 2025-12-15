import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../config/api";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import LoadingSpinner from "./ui/LoadingSpinner";
import "../styles/ChatBox.css";


const ChatBox = ({ projectId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatId, setChatId] = useState(null);
    const [userChatId, setUserChatId] = useState(null);
    const [projectName, setProjectName] = useState("Project Chat");
    const [currentUserId, setCurrentUserId] = useState(null);
    const messagesEndRef = useRef(null);
    const prevMessageCountRef = useRef(0);

    // Auto scroll to bottom only when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Only scroll if the number of messages has increased
        if (messages.length > prevMessageCountRef.current) {
            scrollToBottom();
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                console.log("Fetching current user...");
                const res = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_CURRENT_USER,
                        variables: {},
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (res.data.errors) {
                    throw new Error(res.data.errors[0].message);
                }

                const userData = res.data.data.users.me;
                console.log("Current user data:", userData);
                setCurrentUserId(userData?.id);
                console.log("Set currentUserId to:", userData?.id);
            } catch (err) {
                console.error("Failed to fetch current user:", err);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch project and its chat
    useEffect(() => {
        if (!projectId) return;

        const fetchProjectChat = async () => {
            try {
                // Get project details
                const projectRes = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_PROJECT_BY_ID,
                        variables: { id: parseInt(projectId) },
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (projectRes.data.errors) {
                    throw new Error(projectRes.data.errors[0].message);
                }

                const project = projectRes.data.data.project.projectbyid;
                if (!project) {
                    console.error("Project not found");
                    setLoading(false);
                    return;
                }

                console.log("Project data:", project);
                setProjectName(project.name);
                
                // Get the chat for this project
                console.log("Looking for chat with projectId:", projectId);
                // Fetch all chats and find one for this project
                const chatsRes = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_ALL_CHATS,
                        variables: { first: 50 },
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (!chatsRes.data.errors) {
                    const allChats = chatsRes.data.data.chat.allchats.nodes || [];
                    console.log("All chats:", allChats);
                    const projectChat = allChats.find(chat => chat.projectId === parseInt(projectId));
                    console.log("Found project chat:", projectChat);
                    
                    if (projectChat) {
                        setChatId(projectChat.id);
                    } else {
                        console.log("No chat found for this project");
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch project chat:", err);
                setLoading(false);
            }
        };

        fetchProjectChat();
    }, [projectId]);

    // Fetch UserChat when we have both chatId and currentUserId
    useEffect(() => {
        if (!chatId || !currentUserId) return;

        const fetchUserChat = async () => {
            try {
                console.log("Fetching UserChat for chatId:", chatId, "and userId:", currentUserId);
                const userChatRes = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_USER_CHAT,
                        variables: { chatId: chatId },
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (!userChatRes.data.errors) {
                    const chatData = userChatRes.data.data.chat.chatbyid;
                    console.log("Chat data:", chatData);
                    console.log("Current user ID:", currentUserId);
                    
                    // Handle both array and single object response
                    const chat = Array.isArray(chatData) ? chatData[0] : chatData;
                    
                    const myUserChat = chat?.userChats?.find(uc => uc.userId === currentUserId);
                    console.log("My UserChat:", myUserChat);
                    if (myUserChat) {
                        setUserChatId(myUserChat.id);
                        console.log("UserChatId set to:", myUserChat.id);
                    } else {
                        console.log("UserChat not found for current user");
                    }
                } else {
                    console.error("Error fetching UserChat:", userChatRes.data.errors);
                }
            } catch (err) {
                console.error("Failed to fetch UserChat:", err);
            }
        };

        fetchUserChat();
    }, [chatId, currentUserId]);

    // Fetch messages when chatId is set
    useEffect(() => {
        if (!chatId) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_CHAT_ENTRIES,
                        variables: { chatId: chatId, first: 50 },
                    },
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (res.data.errors) {
                    throw new Error(res.data.errors[0].message);
                }

                const entries = res.data.data.entry.allentries.nodes || [];
                const formattedMessages = entries.map(entry => ({
                    id: entry.id,
                    user: entry.userChat.user.nickname,
                    text: entry.message,
                    avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${entry.userChat.user.nickname}`,
                    self: currentUserId === entry.userChat.user.id,
                }));

                setMessages(formattedMessages);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch messages:", err);
                setLoading(false);
            }
        };

        fetchMessages();
        
        // Poll for new messages every 15 seconds
        const interval = setInterval(fetchMessages, 15000);
        
        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [chatId, currentUserId]);

    const sendMessage = async () => {
        console.log("sendMessage called");
        console.log("input:", input);
        console.log("userChatId:", userChatId);
        
        if (!input.trim() || !userChatId) {
            console.log("Returning early - input or userChatId missing");
            return;
        }

        try {
            console.log("Sending message...");
            const res = await axios.post(
                API_CONFIG.GRAPHQL_ENDPOINT,
                {
                    query: GRAPHQL_QUERIES.CREATE_ENTRY,
                    variables: {
                        input: {
                            userChatId: userChatId,
                            message: input,
                            public: true,
                        },
                    },
                },
                {
                    headers: getAuthHeaders(),
                }
            );

            if (res.data.errors) {
                throw new Error(res.data.errors[0].message);
            }

            console.log("Message sent successfully");
            setInput("");
            
            // Immediately fetch updated messages
            const messagesRes = await axios.post(
                API_CONFIG.GRAPHQL_ENDPOINT,
                {
                    query: GRAPHQL_QUERIES.GET_CHAT_ENTRIES,
                    variables: { chatId: chatId, first: 50 },
                },
                {
                    headers: getAuthHeaders(),
                }
            );

            if (!messagesRes.data.errors) {
                const entries = messagesRes.data.data.entry.allentries.nodes || [];
                const formattedMessages = entries.map(entry => ({
                    id: entry.id,
                    user: entry.userChat.user.nickname,
                    text: entry.message,
                    avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${entry.userChat.user.nickname}`,
                    self: currentUserId === entry.userChat.user.id,
                }));
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <div className="chatbox-all">
                <div className="chatbox-container">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!chatId) {
        return (
            <div className="chatbox-all">
                <div className="chatbox-container">
                    <h2 className="chatbox-title">{projectName}</h2>
                    <p>No chat available for this project yet.</p>
                </div>
            </div>
        );
    }

    return (

        <div className="chatbox-all">

            <div className="chatbox-container">


                <div className="chatbox-content">
                    <div className="chatbox-messages-area">
                        {messages.length === 0 ? (
                            <p>No messages yet. Be the first to send one!</p>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chatbox-message-row ${msg.self ? "self" : ""}`}
                                >
                                    {!msg.self && (
                                        <img src={msg.avatar} alt={msg.user} className="chatbox-avatar"/>
                                    )}
                                    <div className="chatbox-message-content">
                                        {!msg.self && <div className="chatbox-username">{msg.user}</div>}
                                        <div className={`chatbox-message-bubble ${msg.self ? "chatbox-self-bubble" : ""}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                    {msg.self && (
                                        <img src={msg.avatar} alt={msg.user} className="chatbox-avatar"/>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbox-input-area">
                        <input
                            type="text"
                            placeholder="Napisz Wiadomość"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!input.trim()}
                        >
                            Wyślij
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ChatBox;
