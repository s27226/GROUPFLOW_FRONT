import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../config/api";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import LoadingSpinner from "./ui/LoadingSpinner";
import { sanitizeText } from "../utils/sanitize";
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
                const res = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_CURRENT_USER,
                        variables: {}
                    },
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (res.data.errors) {
                    throw new Error(res.data.errors[0].message);
                }

                const userData = res.data.data.users.me;
                setCurrentUserId(userData?.id);
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
                        variables: { id: parseInt(projectId) }
                    },
                    {
                        headers: getAuthHeaders()
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

                setProjectName(project.name);

                // Get the chat for this project
                // Fetch all chats and find one for this project
                const chatsRes = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_ALL_CHATS,
                        variables: { first: 50 }
                    },
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (!chatsRes.data.errors) {
                    const allChats = chatsRes.data.data.chat.allchats.nodes || [];
                    const projectChat = allChats.find(
                        (chat) => chat.projectId === parseInt(projectId)
                    );

                    if (projectChat) {
                        setChatId(projectChat.id);
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
                const userChatRes = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_USER_CHAT,
                        variables: { chatId: chatId }
                    },
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (!userChatRes.data.errors) {
                    const chatData = userChatRes.data.data.chat.chatbyid;

                    // Handle both array and single object response
                    const chat = Array.isArray(chatData) ? chatData[0] : chatData;

                    const myUserChat = chat?.userChats?.find((uc) => uc.userId === currentUserId);
                    if (myUserChat) {
                        setUserChatId(myUserChat.id);
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
                        variables: { chatId: chatId, first: 50 }
                    },
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (res.data.errors) {
                    throw new Error(res.data.errors[0].message);
                }

                const entries = res.data.data.entry.allentries.nodes || [];
                const formattedMessages = entries.map((entry) => ({
                    id: entry.id,
                    user: entry.userChat.user.nickname,
                    text: entry.message,
                    avatar: entry.userChat.user.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${entry.userChat.user.nickname}`,
                    self: currentUserId === entry.userChat.user.id
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
        if (!input.trim() || !userChatId) {
            return;
        }

        try {
            const res = await axios.post(
                API_CONFIG.GRAPHQL_ENDPOINT,
                {
                    query: GRAPHQL_QUERIES.CREATE_ENTRY,
                    variables: {
                        input: {
                            userChatId: userChatId,
                            message: input,
                            public: true
                        }
                    }
                },
                {
                    headers: getAuthHeaders()
                }
            );

            if (res.data.errors) {
                throw new Error(res.data.errors[0].message);
            }

            setInput("");

            // Immediately fetch updated messages
            const messagesRes = await axios.post(
                API_CONFIG.GRAPHQL_ENDPOINT,
                {
                    query: GRAPHQL_QUERIES.GET_CHAT_ENTRIES,
                    variables: { chatId: chatId, first: 50 }
                },
                {
                    headers: getAuthHeaders()
                }
            );

            if (!messagesRes.data.errors) {
                const entries = messagesRes.data.data.entry.allentries.nodes || [];
                const formattedMessages = entries.map((entry) => ({
                    id: entry.id,
                    user: entry.userChat.user.nickname,
                    text: entry.message,
                    avatar: entry.userChat.user.profilePic || `https://api.dicebear.com/9.x/identicon/svg?seed=${entry.userChat.user.nickname}`,
                    self: currentUserId === entry.userChat.user.id
                }));
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
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
                                        <img
                                            src={msg.avatar}
                                            alt={msg.user}
                                            className="chatbox-avatar"
                                        />
                                    )}
                                    <div className="chatbox-message-content">
                                        {!msg.self && (
                                            <div className="chatbox-username">{msg.user}</div>
                                        )}
                                        <div
                                            className={`chatbox-message-bubble ${msg.self ? "chatbox-self-bubble" : ""}`}
                                        >
                                            {sanitizeText(msg.text)}
                                        </div>
                                    </div>
                                    {msg.self && (
                                        <img
                                            src={msg.avatar}
                                            alt={msg.user}
                                            className="chatbox-avatar"
                                        />
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
                        <button onClick={sendMessage} disabled={!input.trim()}>
                            Wyślij
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
