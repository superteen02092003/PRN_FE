import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import './NotificationDropdown.css';

const typeIcons: Record<string, string> = {
    order: 'shopping_bag',
    payment: 'payments',
    warranty: 'shield',
    chat: 'chat',
    info: 'info',
    CartUpdated: 'shopping_cart',
    OrderStatusChanged: 'shopping_bag',
    PaymentConfirmed: 'payments',
    PaymentExpired: 'timer_off',
    WarrantyClaimStatus: 'shield',
    NewChatMessage: 'chat',
    AdminNewOrder: 'shopping_bag',
    AdminPaymentConfirmed: 'payments',
    AdminNewWarrantyClaim: 'shield',
    AdminNewReturnRequest: 'undo',
    AdminNewChatMessage: 'chat',
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
        // Robust parsing: if the string doesn't end with Z or include an offset, add Z to force UTC parsing
        const dateStr = (ts.endsWith('Z') || ts.includes('+') || (ts.includes('-') && ts.includes('T'))) ? ts : ts + 'Z';
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                        <span className="notif-title-header">New Notifications</span>
                    </div>
                    
                    <div className="notif-dropdown-list">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <span className="material-symbols-outlined notif-empty-icon">notifications_off</span>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 15).map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notif-item ${notif.read ? '' : 'unread'}`}
                                    onClick={() => handleNotifClick(notif)}
                                >
                                    <div className={`notif-icon-circle notif-bg-${notif.type}`}>
                                        <span className={`material-symbols-outlined notif-icon notif-icon-${notif.type}`}>
                                            {typeIcons[notif.type] || 'info'}
                                        </span>
                                    </div>
                                    <div className="notif-content">
                                        <span className="notif-title">{notif.title}</span>
                                        <span className="notif-message">{notif.message}</span>
                                        <span className="notif-time">{formatTime(notif.timestamp)}</span>
                                    </div>
                                    {!notif.read && <div className="notif-unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="notif-dropdown-footer">
                        {unreadCount > 0 && (
                            <button className="notif-btn-secondary" onClick={markAllAsRead}>
                                Mark All as Read
                            </button>
                        )}
                        <button className="notif-btn-primary" onClick={() => { setIsOpen(false); navigate('/profile/notifications'); }}>
                            View All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
