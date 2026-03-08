import * as signalR from '@microsoft/signalr';
import api from './api';

// ===== Types =====

export interface ChatMessageDto {
    messageId: number;
    senderId: number;
    senderName: string;
    receiverId: number | null;
    content: string;
    isFromAdmin: boolean;
    sentAt: string;
    isRead: boolean;
}

export interface ConversationDto {
    userId: number;
    userName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

interface PagedChatResponse {
    items: ChatMessageDto[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// ===== SignalR Connection =====

let connection: signalR.HubConnection | null = null;

const getBaseUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    // Remove /api suffix to get base URL for hub
    return apiUrl.replace(/\/api\/?$/, '');
};

export const connectToChat = (
    onReceiveMessage?: (message: ChatMessageDto) => void
): signalR.HubConnection => {
    const token = localStorage.getItem('token') || '';
    const baseUrl = getBaseUrl();

    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/chat`, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    if (onReceiveMessage) {
        connection.on('ReceiveMessage', (message: ChatMessageDto) => {
            onReceiveMessage(message);
        });
    }

    connection.start().catch(err => {
        console.warn('SignalR connection failed, using REST fallback:', err);
    });

    return connection;
};

export const disconnectChat = async (): Promise<void> => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};

export const getConnection = (): signalR.HubConnection | null => connection;

// ===== Send Message =====

/**
 * Try sending via SignalR, fallback to REST if not connected
 */
export const sendMessage = async (
    receiverId: number | null,
    content: string
): Promise<ChatMessageDto | null> => {
    // Try SignalR first
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
            await connection.invoke('SendMessage', receiverId, content);
            return null; // Message delivered via SignalR events
        } catch (err) {
            console.warn('SignalR send failed, falling back to REST:', err);
        }
    }

    // REST fallback
    const response = await api.post<{ success: boolean; data: ChatMessageDto }>('/chat/send', {
        receiverId,
        content,
    });
    return response.data.data;
};

// ===== REST APIs =====

/**
 * Get chat history (Customer: own messages, Admin: all)
 */
export const getChatHistory = async (
    pageNumber: number = 1,
    pageSize: number = 50
): Promise<PagedChatResponse> => {
    const response = await api.get<{
        success: boolean;
        data: PagedChatResponse;
    }>('/chat/history', { params: { pageNumber, pageSize } });
    return response.data.data;
};

/**
 * [Admin] Get list of chat conversations
 */
export const getConversations = async (): Promise<ConversationDto[]> => {
    const response = await api.get<{
        success: boolean;
        data: ConversationDto[];
    }>('/chat/conversations');
    return response.data.data;
};

/**
 * [Admin] Get chat history with specific user
 */
export const getChatHistoryWithUser = async (
    targetUserId: number,
    pageNumber: number = 1,
    pageSize: number = 50
): Promise<PagedChatResponse> => {
    const response = await api.get<{
        success: boolean;
        data: PagedChatResponse;
    }>(`/chat/history/${targetUserId}`, { params: { pageNumber, pageSize } });
    return response.data.data;
};

const chatService = {
    connectToChat,
    disconnectChat,
    sendMessage,
    getChatHistory,
    getConversations,
    getChatHistoryWithUser,
    getConnection,
};

export default chatService;
