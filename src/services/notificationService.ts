import * as signalR from '@microsoft/signalr';

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
    onNotificationReceived: (eventType: string, data: any) => void
): signalR.HubConnection => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
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

    // Register handlers based on backend events
    connection.on('CartUpdated', (data: any) => onNotificationReceived('CartUpdated', data));
    connection.on('OrderStatusChanged', (data: any) => onNotificationReceived('OrderStatusChanged', data));
    connection.on('PaymentConfirmed', (data: any) => onNotificationReceived('PaymentConfirmed', data));
    connection.on('PaymentExpired', (data: any) => onNotificationReceived('PaymentExpired', data));

    connection.start().catch(err => {
        console.warn('SignalR notification connection failed:', err);
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
};

export default notificationService;
