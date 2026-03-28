import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import { connectToChat, getChatHistory, sendMessage, markMyMessagesAsRead, uploadChatImage } from '@/services/chatService';
import type { ChatMessageDto } from '@/services/chatService';
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [pendingImage, setPendingImage] = useState<{ file: File; previewUrl: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentUserId = (() => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr).userId : 0;
        } catch { return 0; }
    })();

    // Redirect admin/staff to /admin/chat
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === 'Admin' || user.role === 'Staff') {
                    navigate('/admin/chat', { replace: true });
                    return;
                }
            }
        } catch { /* ignore */ }
    }, [navigate]);

    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                const data = await getChatHistory(1, 100);
                if (!isCancelled) {
                    setMessages((data.items || []).reverse());
                }
                // Mark admin messages as read when chat is opened
                try { 
                    await markMyMessagesAsRead(); 
                    localStorage.setItem('chatUnreadCount', '0');
                    window.dispatchEvent(new Event('chatUnreadClear'));
                } catch { /* ignore */ }
            } catch (err) {
                console.error('Failed to load chat history:', err);
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };
        load();

        // Connect SignalR and listen
        let cleanupConn = () => {};
        
        const setupChat = async () => {
            if (isCancelled) return;
            const conn = await connectToChat();
            if (isCancelled || !conn) return;

            const handleMsg = (msg: ChatMessageDto) => {
                setMessages(prev => [...prev, msg]);
                window.dispatchEvent(new Event('chatUnreadClear'));
            };
            
            conn.on('ReceiveMessage', handleMsg);
            
            cleanupConn = () => {
                conn.off('ReceiveMessage', handleMsg);
            };
        };
        
        setupChat();

        return () => {
            isCancelled = true;
            cleanupConn();
        };
    }, []);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setPendingImage({ file, previewUrl });
        // Reset so selecting same file again works
        e.target.value = '';
    };

    const handleRemovePendingImage = () => {
        if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
        setPendingImage(null);
    };

    const handleSend = async () => {
        if ((!newMessage.trim() && !pendingImage) || sending) return;

        try {
            setSending(true);

            if (pendingImage) {
                const imageUrl = await uploadChatImage(pendingImage.file);
                URL.revokeObjectURL(pendingImage.previewUrl);
                setPendingImage(null);
                const result = await sendMessage(null, `[img]:${imageUrl}`);
                if (result) setMessages(prev => [...prev, result]);
            }

            if (newMessage.trim()) {
                const result = await sendMessage(null, newMessage.trim());
                if (result) setMessages(prev => [...prev, result]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const renderMessageContent = (content: string) => {
        if (content.startsWith('[img]:')) {
            const src = content.slice(6);
            return <img src={src} alt="Image" className="chat-msg-image" />;
        }
        return <p>{content}</p>;
    };

    const formatTime = (dateStr: string) => {
        const utcStr = (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.includes('T'))) ? dateStr : dateStr + 'Z';
        return new Date(utcStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const utcStr = (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.includes('T'))) ? dateStr : dateStr + 'Z';
        return new Date(utcStr).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Group messages by date
    const groupedMessages: { date: string; messages: ChatMessageDto[] }[] = [];
    messages.forEach(msg => {
        const date = formatDate(msg.sentAt);
        const lastGroup = groupedMessages[groupedMessages.length - 1];
        if (lastGroup && lastGroup.date === date) {
            lastGroup.messages.push(msg);
        } else {
            groupedMessages.push({ date, messages: [msg] });
        }
    });

    return (
        <>
            <Header />
            <main className="chat-page">
                <div className="chat-container">
                    <div className="chat-header-bar">
                        <span className="material-symbols-outlined">support_agent</span>
                        <div>
                            <h2>Support Chat</h2>
                            <span className="chat-subtitle">We typically reply within a few minutes</span>
                        </div>
                    </div>

                    <div className="chat-messages" ref={messagesContainerRef}>
                        {loading ? (
                            <div className="chat-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`chat-msg ${i % 2 === 0 ? 'sent' : 'received'}`}>
                                        <div className="skeleton-box" style={{ width: i % 2 === 0 ? '55%' : '65%', height: '2.5rem', borderRadius: '14px' }} />
                                    </div>
                                ))}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="chat-empty">
                                <div className="chat-empty-icon">
                                    <span className="material-symbols-outlined">forum</span>
                                </div>
                                <h3>Start a Conversation</h3>
                                <p>Send a message and our support team will reply shortly.</p>
                            </div>
                        ) : (
                            groupedMessages.map((group, gi) => (
                                <div key={gi}>
                                    <div className="chat-date-divider">{group.date}</div>
                                    {group.messages.map(msg => (
                                        <div
                                            key={msg.messageId}
                                            className={`chat-msg ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
                                        >
                                            <div className="chat-msg-bubble">
                                                {msg.isFromAdmin && (
                                                    <span className="chat-msg-sender">Support</span>
                                                )}
                                                {renderMessageContent(msg.content)}
                                                <span className="chat-msg-time">{formatTime(msg.sentAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {pendingImage && (
                        <div className="chat-image-preview">
                            <img src={pendingImage.previewUrl} alt="Preview" />
                            <button className="chat-image-preview-remove" onClick={handleRemovePendingImage}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}
                    <div className="chat-input-bar">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                        <button
                            className="chat-image-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending}
                            title="Send image"
                        >
                            <span className="material-symbols-outlined">image</span>
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!newMessage.trim() && !pendingImage) || sending}
                            className="chat-send-btn"
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ChatPage;
