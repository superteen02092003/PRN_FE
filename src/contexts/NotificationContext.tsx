import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';

export interface Notification {
    id: string;
    type: 'order' | 'payment' | 'warranty' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = 'stem_gear_notifications';

const getBaseUrl = (): string => {
    // In dev: use relative URL so Vite proxy handles /hubs/*
    // In production: use the deployed BE base URL
    if (import.meta.env.DEV) return '';
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    return apiUrl.replace(/\/api\/?$/, '');
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotif: Notification = {
            ...notif,
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    }, []);

    // ===== SignalR Connection =====
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const baseUrl = getBaseUrl();
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/hubs/notification`, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        // Listen for CartUpdated
        connection.on('CartUpdated', (data: { totalItems: number; timestamp: string }) => {
            addNotification({
                type: 'info',
                title: 'Cart Updated',
                message: `Your cart now has ${data.totalItems} item(s)`,
                link: '/cart',
            });
        });

        // Listen for OrderStatusChanged
        connection.on('OrderStatusChanged', (data: { orderId: number; orderNumber: string; status: string }) => {
            addNotification({
                type: 'order',
                title: 'Order Status Updated',
                message: `Order #${data.orderNumber} is now ${data.status}`,
                link: `/orders/${data.orderId}`,
            });
        });

        // Listen for PaymentConfirmed
        connection.on('PaymentConfirmed', (data: { orderId: number; orderNumber: string; amount: number }) => {
            const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount);
            addNotification({
                type: 'payment',
                title: 'Payment Confirmed ✅',
                message: `Order #${data.orderNumber} — ${formattedAmount} received successfully`,
                link: `/orders/${data.orderId}`,
            });
        });

        // Listen for PaymentExpired
        connection.on('PaymentExpired', (data: { orderId: number; orderNumber: string }) => {
            addNotification({
                type: 'payment',
                title: 'Payment Expired ⏰',
                message: `Payment for order #${data.orderNumber} has expired`,
                link: `/orders/${data.orderId}`,
            });
        });

        connection.onreconnecting(() => {
            console.log('[NotificationHub] Reconnecting...');
            setIsConnected(false);
        });

        connection.onreconnected(() => {
            console.log('[NotificationHub] Reconnected');
            setIsConnected(true);
        });

        connection.onclose(() => {
            console.log('[NotificationHub] Disconnected');
            setIsConnected(false);
        });

        connection.start()
            .then(() => {
                console.log('[NotificationHub] Connected');
                setIsConnected(true);
            })
            .catch(err => {
                console.warn('[NotificationHub] Connection failed:', err);
            });

        connectionRef.current = connection;

        return () => {
            connection.stop();
            connectionRef.current = null;
        };
    }, [addNotification]);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll, isConnected,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};
