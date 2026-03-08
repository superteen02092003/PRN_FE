import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

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
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = 'stem_gear_notifications';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

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
            notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll,
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
