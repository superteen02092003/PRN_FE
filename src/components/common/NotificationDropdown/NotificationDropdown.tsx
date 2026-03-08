import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import './NotificationDropdown.css';

const typeIcons: Record<string, string> = {
    order: 'shopping_bag',
    payment: 'payments',
    warranty: 'shield',
    info: 'info',
};

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotifClick = (notif: { id: string; link?: string }) => {
        markAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
            setIsOpen(false);
        }
    };

    const formatTime = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="notif-dropdown-wrapper" ref={dropdownRef}>
            <button className="notif-bell-btn" onClick={() => setIsOpen(!isOpen)}>
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button className="notif-mark-all" onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="notif-dropdown-list">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">No notifications yet</div>
                        ) : (
                            notifications.slice(0, 15).map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notif-item ${notif.read ? '' : 'unread'}`}
                                    onClick={() => handleNotifClick(notif)}
                                >
                                    <span className={`material-symbols-outlined notif-icon notif-icon-${notif.type}`}>
                                        {typeIcons[notif.type] || 'info'}
                                    </span>
                                    <div className="notif-content">
                                        <span className="notif-title">{notif.title}</span>
                                        <span className="notif-message">{notif.message}</span>
                                    </div>
                                    <span className="notif-time">{formatTime(notif.timestamp)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
