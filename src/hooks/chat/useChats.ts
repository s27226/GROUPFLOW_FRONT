import { useState, useEffect, useCallback } from "react";
import { useGraphQL, useQuery } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../queries/graphql";

interface ChatUser {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface UserChatData {
    id: number;
    chat: {
        id: number;
        projectId?: number | null;
        userChats?: Array<{
            userId: number;
            user: ChatUser;
        }>;
    };
}

interface FormattedChat {
    id: number;
    userChatId: number;
    friend: ChatUser | Record<string, never>;
    projectId?: number | null;
    lastMessage: string;
    unread: number;
}

interface ChatEntry {
    id: number;
    message: string;
    sent: string;
    public?: boolean;
    userChat: {
        userId: number;
        user: ChatUser;
    };
}

interface FormattedMessage {
    id: number;
    from: "me" | "them";
    text: string;
    sent: string;
    sender: ChatUser;
    public?: boolean;
}

interface UseChatsOptions {
    autoFetch?: boolean;
}

interface UseChatMessagesOptions {
    autoFetch?: boolean;
    pollInterval?: number;
}

/**
 * Custom hook for managing user chats
 * Uses useQuery for unified loading/error state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch chats automatically on mount (default: true)
 * @returns {Object} { chats, loading, error, refetch, createDirectChat }
 */
export const useChats = (options: UseChatsOptions = {}) => {
    const { autoFetch = true } = options;
    const { executeQuery } = useGraphQL();
    const { user: currentUser, isAuthenticated, authLoading } = useAuth();

    const { data: chats, loading, error, refetch, setData: setChats } = useQuery<FormattedChat[]>(
        GRAPHQL_QUERIES.GET_MY_USER_CHATS,
        {},
        {
            skip: authLoading || !isAuthenticated || !currentUser || !autoFetch,
            autoFetch: autoFetch,
            initialData: [],
            transform: (data: unknown): FormattedChat[] => {
                const typedData = data as { userChat?: { myuserchats?: UserChatData[] } } | null;
                const userChats = typedData?.userChat?.myuserchats || [];
                const currentUserId = currentUser?.id ?? null;
                return userChats.map((uc): FormattedChat => {
                    // Find the other user in the chat
                    const otherUserChat = uc.chat.userChats?.find(
                        (chat) => chat.userId !== currentUserId
                    );
                    
                    return {
                        id: uc.chat.id,
                        userChatId: uc.id,
                        friend: otherUserChat?.user || {},
                        projectId: uc.chat.projectId,
                        lastMessage: "...",
                        unread: 0
                    };
                });
            }
        }
    );

    const createDirectChat = useCallback(
        async (friendId: number) => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_OR_CREATE_DIRECT_CHAT, {
                    friendId
                }) as { chat?: { getorcreatedirectchat?: { id: number } } } | null;
                const chat = data?.chat?.getorcreatedirectchat;
                
                if (chat) {
                    // Refresh chats list
                    await refetch();
                    return chat;
                }
                return null;
            } catch (err) {
                console.error("Failed to create direct chat:", err);
                throw err;
            }
        },
        [executeQuery, refetch]
    );

    return {
        chats,
        loading,
        error,
        refetch,
        createDirectChat
    };
};

/**
 * Custom hook for managing messages in a specific chat
 * Uses useQuery for unified loading/error state management with polling support
 * @param {number} chatId - Chat ID to fetch messages for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch messages automatically
 * @param {number} options.pollInterval - Polling interval in milliseconds (0 to disable)
 * @returns {Object} { messages, loading, error, refetch, sendMessage }
 */
export const useChatMessages = (chatId: number | string, options: UseChatMessagesOptions = {}) => {
    const { autoFetch = true, pollInterval = 3000 } = options;
    const { executeQuery, executeMutation } = useGraphQL();
    const { user: currentUser } = useAuth();

    const { data: messages, loading, error, refetch, setData: setMessages } = useQuery<FormattedMessage[]>(
        GRAPHQL_QUERIES.GET_CHAT_MESSAGES,
        { chatId: parseInt(String(chatId)) },
        {
            skip: !chatId || !autoFetch,
            autoFetch: autoFetch && !!chatId,
            initialData: [],
            transform: (data: unknown): FormattedMessage[] => {
                const typedData = data as { entry?: { chatmessages?: ChatEntry[] } } | null;
                const entries = typedData?.entry?.chatmessages || [];
                const currentUserId = currentUser?.id ?? null;
                return entries.map((entry): FormattedMessage => ({
                    id: entry.id,
                    from: entry.userChat.userId === currentUserId ? "me" : "them",
                    text: entry.message,
                    sent: entry.sent,
                    sender: entry.userChat.user,
                    public: entry.public
                }));
            }
        }
    );

    // Polling for new messages
    useEffect(() => {
        if (!chatId || pollInterval <= 0) return;

        const interval = setInterval(() => {
            refetch();
        }, pollInterval);

        return () => clearInterval(interval);
    }, [chatId, pollInterval, refetch]);

    const sendMessage = useCallback(
        async (userChatId: number | string, content: string, isPublic: boolean = true) => {
            if (!content.trim()) return null;

            try {
                const result = await executeMutation(GRAPHQL_MUTATIONS.SEND_MESSAGE, {
                    input: {
                        userChatId: parseInt(String(userChatId)),
                        message: content.trim(),
                        public: isPublic
                    }
                });

                // Refresh messages after sending
                await refetch();
                return result;
            } catch (err) {
                console.error("Failed to send message:", err);
                throw err;
            }
        },
        [executeMutation, refetch]
    );

    return {
        messages,
        loading,
        error,
        refetch,
        sendMessage
    };
};
