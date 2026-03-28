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
let isConnecting = false;

const getBaseUrl = (): string => {
    if (import.meta.env.DEV) return '';
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    return apiUrl.replace(/\/api\/?$/, '');
};

export const connectToChat = async (): Promise<signalR.HubConnection> => {
    if (connection && (connection.state === signalR.HubConnectionState.Connected || isConnecting)) {
        return connection;
    }

    isConnecting = true;
    const token = localStorage.getItem('token') || '';
    const baseUrl = getBaseUrl();

    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/chat`, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    // Global listener for realtime badge updates on ANY page
    connection.on('ReceiveMessage', () => {
        window.dispatchEvent(new Event('chatUnreadIncrement'));
    });

    try {
        await connection.start();
    } catch (err) {
        console.warn('SignalR connection failed, using REST fallback:', err);
    } finally {
        isConnecting = false;
    }

    return connection;
};

export const disconnectChat = async (): Promise<void> => {
    // We intentionally DO NOT stop the connection anymore, 
    // so that global unread counters continue to receive events.
};

export const getConnection = (): signalR.HubConnection | null => connection;

// ===== Upload Image =====

export const uploadChatImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<{ success: boolean; data: { imageUrl: string } }>(
        '/chat/upload-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data.imageUrl;
};

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

// [Admin] Mark messages from a user as read
export const markAsRead = async (userId: number): Promise<void> => {
    await api.post(`/chat/mark-read/${userId}`);
};

// [Customer] Mark admin messages as read
export const markMyMessagesAsRead = async (): Promise<void> => {
    await api.post('/chat/mark-read');
};

// Get unread message count
export const getUnreadCount = async (): Promise<number> => {
    const response = await api.get<{ success: boolean; data: { unreadCount: number } }>('/chat/unread-count');
    return response.data.data.unreadCount;
};

const chatService = {
    connectToChat,
    disconnectChat,
    sendMessage,
    uploadChatImage,
    getChatHistory,
    getConversations,
    getChatHistoryWithUser,
    getConnection,
    markAsRead,
    markMyMessagesAsRead,
    getUnreadCount,
};

export default chatService;
