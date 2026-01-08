import { useState, useEffect, useCallback } from "react";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import { useGraphQL } from "./useGraphQL";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook for managing chat functionality
 * Handles chat initialization, message loading, sending, and polling
 */
export function useChat(user, currentUserId) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatId, setChatId] = useState(null);
    const [userChatId, setUserChatId] = useState(null);
    const { executeQuery } = useGraphQL();

    // Load messages for a chat
    const loadMessages = useCallback(async (chatIdToLoad) => {
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_CHAT_MESSAGES, {
                chatId: chatIdToLoad
            });

            const entries = data.entry.chatmessages || [];
            setMessages(
                entries.map((entry) => ({
                    id: entry.id,
                    from: entry.userChat.userId === currentUserId ? "me" : "them",
                    text: entry.message,
                    sent: entry.sent,
                    sender: entry.userChat.user
                }))
            );
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    }, [executeQuery, currentUserId]);

    // Fetch or create chat and load messages
    useEffect(() => {
        const initializeChat = async () => {
            try {
                setLoading(true);

                // Get or create direct chat with this friend
                const chatData = await executeQuery(GRAPHQL_QUERIES.GET_OR_CREATE_DIRECT_CHAT, {
                    friendId: user.id
                });

                const chat = chatData.chat.getorcreatedirectchat;
                if (!chat) {
                    throw new Error("Failed to create or retrieve chat");
                }

                setChatId(chat.id);

                // Get my UserChat ID for this chat
                const userChatData = await executeQuery(GRAPHQL_QUERIES.GET_MY_USER_CHAT, {
                    chatId: chat.id
                });

                const myUserChat = userChatData.userChat.myuserchat;
                setUserChatId(myUserChat.id);

                // Load messages for this chat
                await loadMessages(chat.id);
            } catch (err) {
                console.error("Failed to initialize chat:", err);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        if (user && currentUserId) {
            initializeChat();
        }
    }, [user, currentUserId, executeQuery, loadMessages]);

    // Removed auto-scroll on messages change - users can scroll manually

    // Poll for new messages every 3 seconds
    useEffect(() => {
        if (!chatId) return;

        const interval = setInterval(() => {
            loadMessages(chatId);
        }, 3000);

        return () => clearInterval(interval);
    }, [chatId, loadMessages]);

    // Send message function
    const sendMessage = async () => {
        if (input.trim() === "" || !userChatId) return;

        try {
            const data = await executeQuery(GRAPHQL_MUTATIONS.SEND_MESSAGE, {
                input: {
                    userChatId: userChatId,
                    message: input,
                    public: false
                }
            });

            const newEntry = data.entry.createEntry;

            // Add the new message to the list
            setMessages([
                ...messages,
                {
                    id: newEntry.id,
                    from: "me",
                    text: newEntry.message,
                    sent: newEntry.sent,
                    sender: newEntry.userChat.user
                }
            ]);

            setInput("");
        } catch (err) {
            console.error("Failed to send message:", err);
            // Don't show toast here as it's handled in the component
            console.warn("Message send failed - user will be notified");
        }
    };

    // Handle key press for Enter key
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return {
        messages,
        input,
        setInput,
        loading,
        sendMessage,
        handleKeyPress
    };
}
