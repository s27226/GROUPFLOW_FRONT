import { useState, useEffect, useCallback } from "react";
import { useGraphQL } from "./useGraphQL";
import { useAuth } from "../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";

/**
 * Custom hook for managing user chats
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch chats automatically on mount (default: true)
 * @returns {Object} { chats, loading, error, refetch, createDirectChat }
 */
export const useChats = (options = {}) => {
    const { autoFetch = true } = options;
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery } = useGraphQL();
    const { user: currentUser, isAuthenticated, authLoading } = useAuth();

    const fetchChats = useCallback(async () => {
        if (!currentUser || !isAuthenticated) return [];

        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_MY_USER_CHATS, {});
            const userChats = data?.userChat?.myuserchats || [];
            
            const chatList = userChats.map(uc => {
                // Find the other user in the chat
                const otherUserChat = uc.chat.userChats?.find(
                    chat => chat.userId !== currentUser.id
                );
                
                return {
                    id: uc.chat.id,
                    userChatId: uc.id,
                    friend: otherUserChat?.user || {},
                    projectId: uc.chat.projectId,
                    lastMessage: "...", // Could be enhanced with actual last message
                    unread: 0 // Could be enhanced with actual unread count
                };
            });
            
            setChats(chatList);
            return chatList;
        } catch (err) {
            console.error("Failed to fetch chats:", err);
            setError(err);
            setChats([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery, currentUser, isAuthenticated]);

    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated && currentUser) {
            fetchChats();
        }
    }, [autoFetch, authLoading, isAuthenticated, currentUser, fetchChats]);

    const createDirectChat = useCallback(
        async (friendId) => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_OR_CREATE_DIRECT_CHAT, {
                    friendId
                });
                const chat = data?.chat?.getorcreatedirectchat;
                
                if (chat) {
                    // Refresh chats list
                    await fetchChats();
                    return chat;
                }
                return null;
            } catch (err) {
                console.error("Failed to create direct chat:", err);
                throw err;
            }
        },
        [executeQuery, fetchChats]
    );

    return {
        chats,
        loading,
        error,
        refetch: fetchChats,
        createDirectChat
    };
};

/**
 * Custom hook for managing messages in a specific chat
 * @param {number} chatId - Chat ID to fetch messages for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch messages automatically
 * @param {number} options.pollInterval - Polling interval in milliseconds (0 to disable)
 * @returns {Object} { messages, loading, error, refetch, sendMessage }
 */
export const useChatMessages = (chatId, options = {}) => {
    const { autoFetch = true, pollInterval = 3000 } = options;
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { executeQuery, executeMutation } = useGraphQL();
    const { user: currentUser } = useAuth();

    const fetchMessages = useCallback(async () => {
        if (!chatId) return [];

        setLoading(true);
        setError(null);
        try {
            const data = await executeQuery(GRAPHQL_QUERIES.GET_CHAT_MESSAGES, {
                chatId: parseInt(chatId)
            });

            const entries = data?.entry?.chatmessages || [];
            const formattedMessages = entries.map((entry) => ({
                id: entry.id,
                from: entry.userChat.userId === currentUser?.id ? "me" : "them",
                text: entry.message,
                sent: entry.sent,
                sender: entry.userChat.user,
                public: entry.public
            }));
            
            setMessages(formattedMessages);
            return formattedMessages;
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            setError(err);
            setMessages([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery, chatId, currentUser]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch && chatId) {
            fetchMessages();
        }
    }, [autoFetch, chatId, fetchMessages]);

    // Polling for new messages
    useEffect(() => {
        if (!chatId || pollInterval <= 0) return;

        const interval = setInterval(() => {
            fetchMessages();
        }, pollInterval);

        return () => clearInterval(interval);
    }, [chatId, pollInterval, fetchMessages]);

    const sendMessage = useCallback(
        async (userChatId, content, isPublic = true) => {
            if (!content.trim()) return null;

            try {
                const result = await executeMutation(GRAPHQL_MUTATIONS.SEND_MESSAGE, {
                    input: {
                        userChatId: parseInt(userChatId),
                        message: content.trim(),
                        public: isPublic
                    }
                });

                // Refresh messages after sending
                await fetchMessages();
                return result;
            } catch (err) {
                console.error("Failed to send message:", err);
                throw err;
            }
        },
        [executeMutation, fetchMessages]
    );

    return {
        messages,
        loading,
        error,
        refetch: fetchMessages,
        sendMessage
    };
};
