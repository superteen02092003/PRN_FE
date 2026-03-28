import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import notificationService from '@/services/notificationService';
import { connectToChat } from '@/services/chatService';

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

import { useAuth } from './AuthContext';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated } = useAuth();

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
        if (!isAuthenticated) {
            setIsConnected(false);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchNotifications();

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Also ensure ChatHub is connected globally so we receive chatUnreadIncrement on any page
            connectToChat().catch(console.error);

            const conn = notificationService.connectNotifications(
                (eventType, data) => {
                    const id = data.id?.toString() || `${Date.now()}`;

                    let title = data.title || 'New Notification';
                    let message = data.message || '';
                    let type: string = eventType;
                    let link: string | undefined = undefined;

                    if (!data.title) {
                        switch (eventType) {
                            case 'OrderStatusChanged':
                                type = 'order';
                                title = 'Order Status Update';
                                message = `Your order #${data.orderNumber} is now ${data.status.replace('_', ' ')}.`;
                                link = `/orders`;
                                break;
                            case 'PaymentConfirmed':
                                type = 'payment';
                                title = 'Payment Successful';
                                message = `Payment of ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount)} confirmed for order #${data.orderNumber}.`;
                                link = `/orders`;
                                break;
                            case 'PaymentExpired':
                                type = 'payment';
                                title = 'Payment Expired';
                                message = `Payment for order #${data.orderNumber} has expired.`;
                                link = `/orders`;
                                break;
                            case 'WarrantyClaimStatus':
                                type = 'warranty';
                                title = `Warranty Claim ${data.status ? data.status.charAt(0) + data.status.slice(1).toLowerCase() : 'Updated'}`;
                                message = `Your warranty claim for '${data.productName}' status: ${data.status}.`;
                                link = `/warranties/claims`;
                                break;
                            case 'NewChatMessage':
                                type = 'chat';
                                title = `New message from ${data.senderName}`;
                                message = data.messagePreview || 'You have a new message.';
                                link = `/chat`;
                                window.dispatchEvent(new Event('chatUnreadIncrement'));
                                break;
                            default:
                                title = `Notification: ${eventType}`;
                                message = JSON.stringify(data);
                                break;
                        }
                    } else {
                        type = data.type;
                        link = data.linkUrl || `/orders`;
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
                },
                () => setIsConnected(true),   // onConnected
                () => setIsConnected(false)    // onDisconnected
            );

            // Reconnection lifecycle handlers
            conn.onreconnecting(() => setIsConnected(false));
            conn.onreconnected(() => {
                setIsConnected(true);
                fetchNotifications(); // Re-fetch để bắt notifications bị miss khi mất kết nối
            });
            conn.onclose(() => setIsConnected(false));
        } catch (error) {
            console.error('Failed to initialize Notification SignalR:', error);
            setIsConnected(false);
        }

        return () => {
            notificationService.disconnectNotifications().catch(console.error);
        };
    }, [addNotification, fetchNotifications, isAuthenticated]);

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
