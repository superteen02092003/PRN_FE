import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import notificationService from '@/services/notificationService';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notif: Notification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAll: () => void;
    isConnected: boolean;
    fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const data = await notificationService.getMyNotifications(1, 50);
            if (data?.data) {
                const dtoItems = data.data.items || [];
                setNotifications(dtoItems.map((n: any) => ({
                    id: n.notificationId.toString(),
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    timestamp: n.createdAt,
                    read: n.isRead,
                    link: n.linkUrl
                })));
                setUnreadCount(data.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    const addNotification = useCallback((notif: Notification) => {
        setNotifications(prev => [notif, ...prev].slice(0, 50));
        if (!notif.read) setUnreadCount(prev => prev + 1);
    }, []);

    // SignalR Connection
    useEffect(() => {
        fetchNotifications();

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setIsConnected(true);
            notificationService.connectNotifications((eventType, data) => {
                const id = data.id?.toString() || `${Date.now()}`;
                
                let title = data.title || 'New Notification';
                let message = data.message || '';
                let type: string = eventType;
                let link: string | undefined = undefined;

                if (!data.title) {
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
                            link = `/profile/orders`;
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
                } else {
                    type = data.type;
                    link = `/profile/orders`; // Best effort fallback for old unlinked ones if not passed
                }

                addNotification({ 
                    id,
                    type, 
                    title, 
                    message, 
                    link,
                    read: false,
                    timestamp: data.timestamp || new Date().toISOString()
                });
            });
        } catch (error) {
            console.error('Failed to initialize Notification SignalR:', error);
            setIsConnected(false);
        }

        return () => {
            notificationService.disconnectNotifications().catch(console.error);
        };
    }, [addNotification, fetchNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        try {
            await notificationService.markAsRead(parseInt(id, 10));
        } catch (e) { console.error('Failed to mark as read API', e); }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        try {
            await notificationService.markAllAsRead();
        } catch (e) { console.error('Failed to mark all as read API', e); }
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll, isConnected, fetchNotifications
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
