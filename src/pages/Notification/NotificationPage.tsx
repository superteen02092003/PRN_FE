import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import './NotificationPage.css';

const typeIcons: Record<string, string> = {
    order: 'shopping_bag',
    payment: 'payments',
    warranty: 'shield',
    info: 'info',
};

const NotificationPage = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleNotifClick = (notif: { id: string; link?: string; read: boolean }) => {
        if (!notif.read) {
            markAsRead(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const formatTime = (ts: string) => {
        const date = new Date(ts);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        if (hours < 48) return 'Hôm qua';
        return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="notif-page-layout">
            <Header />
            <main className="notif-page-main">
                <div className="notif-page-container">
                    <div className="notif-page-header">
                        <div className="notif-page-title">
                            <h2>My Notifications</h2>
                            {unreadCount > 0 && <span className="notif-page-badge">{unreadCount}</span>}
                        </div>
                        {unreadCount > 0 && (
                            <button className="notif-page-markall" onClick={markAllAsRead}>
                                <span className="material-symbols-outlined">done_all</span>
                                Mark All as Read
                            </button>
                        )}
                    </div>

                    <div className="notif-page-content">
                        {notifications.length === 0 ? (
                            <div className="notif-page-empty">
                                <span className="material-symbols-outlined">notifications_off</span>
                                <h3>No Notifications</h3>
                                <p>You don't have any notifications yet. Go shopping to receive updates!</p>
                                <button className="btn btn-primary" onClick={() => navigate('/products')}>
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="notif-page-list">
                                {notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`notif-page-item ${notif.read ? '' : 'unread'}`}
                                        onClick={() => handleNotifClick(notif)}
                                    >
                                        <div className={`notif-page-icon-wrapper bg-${notif.type}`}>
                                            <span className={`material-symbols-outlined icon-${notif.type}`}>
                                                {typeIcons[notif.type] || 'info'}
                                            </span>
                                        </div>
                                        <div className="notif-page-details">
                                            <h4 className="notif-page-item-title">{notif.title}</h4>
                                            <p className="notif-page-item-message">{notif.message}</p>
                                            <span className="notif-page-item-time">{formatTime(notif.timestamp)}</span>
                                        </div>
                                        {!notif.read && <div className="notif-page-unread-dot"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotificationPage;
