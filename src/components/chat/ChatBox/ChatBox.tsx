import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "../../../config/api";
import { GRAPHQL_QUERIES } from "../../../queries/graphql";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { sanitizeText } from "../../../utils/sanitize";
import { useAuth } from "../../../context/AuthContext";
import { getProfilePicUrl } from "../../../utils/profilePicture";
import styles from "./ChatBox.module.css";

interface ChatBoxProps {
    projectId: string;
}

interface ChatBoxMessage {
    id: string;
    user: string;
    text: string;
    avatar: string;
    self: boolean;
}

interface ChatEntry {
    id: string;
    message: string;
    userChat: {
        user: {
            id: string;
            nickname: string;
            profilePic?: string;
            profilePicUrl?: string;
        };
    };
}

interface ChatData {
    id: number;
    projectId: number;
}

interface UserChatData {
    id: number;
    userId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ projectId }) => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatBoxMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatId, setChatId] = useState<number | null>(null);
    const [userChatId, setUserChatId] = useState<number | null>(null);
    const [projectName, setProjectName] = useState("Project Chat");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessageCountRef = useRef<number>(0);

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
                        headers: getAuthHeaders(),
                        withCredentials: true
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
                        headers: getAuthHeaders(),
                        withCredentials: true
                    }
                );

                if (!chatsRes.data.errors) {
                    const allChats = chatsRes.data.data.chat.allchats.nodes || [];
                    const projectChat = allChats.find(
                        (chat: ChatData) => chat.projectId === parseInt(projectId)
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

    // Fetch UserChat when we have both chatId and currentUser
    useEffect(() => {
        if (!chatId || !currentUser) return;

        const fetchUserChat = async () => {
            try {
                const userChatRes = await axios.post(
                    API_CONFIG.GRAPHQL_ENDPOINT,
                    {
                        query: GRAPHQL_QUERIES.GET_USER_CHAT,
                        variables: { chatId: chatId }
                    },
                    {
                        headers: getAuthHeaders(),
                        withCredentials: true
                    }
                );

                if (!userChatRes.data.errors) {
                    const chatData = userChatRes.data.data.chat.chatbyid;

                    // Handle both array and single object response
                    const chat = Array.isArray(chatData) ? chatData[0] : chatData;

                    const myUserChat = chat?.userChats?.find((uc: UserChatData) => uc.userId === currentUser.id);
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
    }, [chatId, currentUser]);

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
                        headers: getAuthHeaders(),
                        withCredentials: true
                    }
                );

                if (res.data.errors) {
                    throw new Error(res.data.errors[0].message);
                }

                const entries: ChatEntry[] = res.data.data.entry.allentries.nodes || [];
                const formattedMessages: ChatBoxMessage[] = entries.map((entry) => ({
                    id: entry.id,
                    user: entry.userChat.user.nickname,
                    text: entry.message,
                    avatar: getProfilePicUrl(entry.userChat.user.profilePicUrl, entry.userChat.user.nickname),
                    self: currentUser?.id === entry.userChat.user.id
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
    }, [chatId, currentUser]);

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
                    headers: getAuthHeaders(),
                    withCredentials: true
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
                    headers: getAuthHeaders(),
                    withCredentials: true
                }
            );

            if (!messagesRes.data.errors) {
                const entries: ChatEntry[] = messagesRes.data.data.entry.allentries.nodes || [];
                const formattedMessages: ChatBoxMessage[] = entries.map((entry) => ({
                    id: entry.id,
                    user: entry.userChat.user.nickname,
                    text: entry.message,
                    avatar: getProfilePicUrl(entry.userChat.user.profilePicUrl, entry.userChat.user.nickname),
                    self: currentUser?.id === entry.userChat.user.id
                }));
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <div className={styles.chatboxAll}>
                <div className={styles.chatboxContainer}>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!chatId) {
        return (
            <div className={styles.chatboxAll}>
                <div className={styles.chatboxContainer}>
                    <p>{t('chat.noChatAvailable')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatboxAll}>
            <div className={styles.chatboxContainer}>
                <div className={styles.chatboxContent}>
                    <div className={styles.chatboxMessagesArea}>
                        {messages.length === 0 ? (
                            <p>{t('chat.noMessagesYet')}</p>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${styles.chatboxMessageRow} ${msg.self ? styles.self : ""}`}
                                >
                                    {!msg.self && (
                                        <img
                                            src={msg.avatar}
                                            alt={msg.user}
                                            className={styles.chatboxAvatar}
                                        />
                                    )}
                                    <div className={styles.chatboxMessageContent}>
                                        {!msg.self && (
                                            <div className={styles.chatboxUsername}>{msg.user}</div>
                                        )}
                                        <div
                                            className={`${styles.chatboxMessageBubble} ${msg.self ? styles.chatboxSelfBubble : ""}`}
                                        >
                                            {sanitizeText(msg.text)}
                                        </div>
                                    </div>
                                    {msg.self && (
                                        <img
                                            src={msg.avatar}
                                            alt={msg.user}
                                            className={styles.chatboxAvatar}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.chatboxInputArea}>
                        <input
                            type="text"
                            placeholder={t('chat.writeMessage')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <button onClick={sendMessage} disabled={!input.trim()}>
                            {t('chat.send')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
