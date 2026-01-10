import { useState, useEffect, useCallback, useRef, KeyboardEvent } from "react";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../queries/graphql";
import { useGraphQL } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../types";

interface ChatUser {
    id: number;
    name?: string;
    surname?: string;
    nickname?: string;
    profilePic?: string;
}

interface ChatMessageEntry {
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
}

interface UseChatReturn {
    messages: FormattedMessage[];
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    sendMessage: () => Promise<void>;
    handleKeyPress: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Custom hook for managing chat functionality
 * Handles chat initialization, message loading, sending, and polling
 */
export function useChat(user: ChatUser | null, currentUserId: number | null): UseChatReturn {
    const [messages, setMessages] = useState<FormattedMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatId, setChatId] = useState<number | null>(null);
    const [userChatId, setUserChatId] = useState<number | null>(null);
    const { executeQuery } = useGraphQL();
    const executeQueryRef = useRef(executeQuery);
    const hasInitialized = useRef(false);
    
    // Update ref when executeQuery changes
    useEffect(() => {
        executeQueryRef.current = executeQuery;
    });

    // Load messages for a chat
    const loadMessages = useCallback(async (chatIdToLoad: number): Promise<void> => {
        try {
            const data = await executeQueryRef.current(GRAPHQL_QUERIES.GET_CHAT_MESSAGES, {
                chatId: chatIdToLoad
            }) as { entry: { chatmessages: ChatMessageEntry[] } };

            const entries = data.entry.chatmessages || [];
            setMessages(
                entries.map((entry): FormattedMessage => ({
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
    }, [currentUserId]);

    // Fetch or create chat and load messages
    useEffect(() => {
        const initializeChat = async () => {
            if (!user) return;
            
            try {
                setLoading(true);

                // Get or create direct chat with this friend
                const chatData = await executeQueryRef.current(GRAPHQL_QUERIES.GET_OR_CREATE_DIRECT_CHAT, {
                    friendId: user.id
                }) as { chat?: { getorcreatedirectchat?: { id: number } } } | null;

                const chat = chatData?.chat?.getorcreatedirectchat;
                if (!chat) {
                    throw new Error("Failed to create or retrieve chat");
                }

                setChatId(chat.id);

                // Get my UserChat ID for this chat
                const userChatData = await executeQueryRef.current(GRAPHQL_QUERIES.GET_MY_USER_CHAT, {
                    chatId: chat.id
                }) as { userChat?: { myuserchat?: { id: number } } } | null;

                const myUserChat = userChatData?.userChat?.myuserchat;
                if (!myUserChat) {
                    throw new Error("Failed to get user chat");
                }
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

        if (user && currentUserId && !hasInitialized.current) {
            hasInitialized.current = true;
            initializeChat();
        }
    }, [user, currentUserId, loadMessages]);

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
            const data = await executeQueryRef.current(GRAPHQL_MUTATIONS.SEND_MESSAGE, {
                input: {
                    userChatId: userChatId,
                    message: input,
                    public: false
                }
            }) as { entry?: { createEntry?: ChatMessageEntry } } | null;

            const newEntry = data?.entry?.createEntry;
            if (!newEntry) {
                throw new Error("Failed to send message");
            }

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
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
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
