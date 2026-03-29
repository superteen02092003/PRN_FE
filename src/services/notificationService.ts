import * as signalR from '@microsoft/signalr';
import axiosInstance from './api';

export interface NotificationDto {
    notificationId: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    linkUrl?: string;
    createdAt: string;
}

export interface NotificationResponse {
    items: NotificationDto[];
    unreadCount: number;
}

export interface NotificationPayload {
    eventType: string;
    data: any;
}

let connection: signalR.HubConnection | null = null;

const getBaseUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    return apiUrl.replace(/\/api\/?$/, '');
};

export const connectNotifications = (
    onNotificationReceived: (eventType: string, data: any) => void,
    onConnected?: () => void,
    onDisconnected?: () => void
): signalR.HubConnection => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        onConnected?.();
        return connection;
    }

    const token = localStorage.getItem('token') || '';
    const baseUrl = getBaseUrl();

    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notification`, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    // Register handlers based on backend events (CartUpdated removed — not displayed for UX)
    connection.on('OrderStatusChanged', (data: any) => onNotificationReceived('OrderStatusChanged', data));
    connection.on('PaymentConfirmed', (data: any) => onNotificationReceived('PaymentConfirmed', data));
    connection.on('PaymentExpired', (data: any) => onNotificationReceived('PaymentExpired', data));
    connection.on('WarrantyClaimStatus', (data: any) => onNotificationReceived('WarrantyClaimStatus', data));
    connection.on('NewChatMessage', (data: any) => onNotificationReceived('NewChatMessage', data));

    connection.start()
        .then(() => onConnected?.())
        .catch(err => {
            console.warn('SignalR notification connection failed:', err);
            onDisconnected?.();
        });

    return connection;
};

export const disconnectNotifications = async (): Promise<void> => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};

const notificationService = {
    connectNotifications,
    disconnectNotifications,
    getMyNotifications: async (page: number = 1, pageSize: number = 20) => {
        const response = await axiosInstance.get(`/Notification`, { params: { page, pageSize } });
        return response.data;
    },
    markAsRead: async (id: number) => {
        const response = await axiosInstance.put(`/Notification/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await axiosInstance.put(`/Notification/read-all`);
        return response.data;
    }
};

export default notificationService;
