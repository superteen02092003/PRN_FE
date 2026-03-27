import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import notificationService from '@/services/notificationService';

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

    // SignalR Connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        notificationService.connectNotifications((eventType, data) => {
            let title = 'New Notification';
            let message = '';
            let type: Notification['type'] = 'info';
            let link: string | undefined = undefined;

            switch (eventType) {
                case 'CartUpdated':
                    type = 'order';
                    title = 'Cart Updated';
                    message = `You have ${data.totalItems} items in your cart.`;
                    link = '/cart';
                    break;
                case 'OrderStatusChanged':
                    type = 'order';
                    title = 'Order Status Update';
                    message = `Your order #${data.orderNumber} is now ${data.status.replace('_', ' ')}.`;
                    link = `/profile/orders`; // Assuming this route exists
                    break;
                case 'PaymentConfirmed':
                    type = 'payment';
                    title = 'Payment Successful';
                    message = `Payment of ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount)} confirmed for order #${data.orderNumber}.`;
                    link = `/profile/orders`;
                    break;
                case 'PaymentExpired':
                    type = 'payment';
                    title = 'Payment Expired';
                    message = `Payment for order #${data.orderNumber} has expired.`;
                    link = `/profile/orders`;
                    break;
                default:
                    title = `Notification: ${eventType}`;
                    message = JSON.stringify(data);
                    break;
            }

            addNotification({ type, title, message, link });
        });

        return () => {
            notificationService.disconnectNotifications();
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
