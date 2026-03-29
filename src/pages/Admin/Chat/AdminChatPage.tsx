import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { connectToChat, getConversations, getChatHistoryWithUser, sendMessage, markAsRead, uploadChatImage } from '@/services/chatService';
import type { ChatMessageDto, ConversationDto } from '@/services/chatService';
import './AdminChatPage.css';

const AdminChatPage = () => {
    const [conversations, setConversations] = useState<ConversationDto[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [pendingImage, setPendingImage] = useState<{ file: File; previewUrl: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load conversations
    useEffect(() => {
        const load = async () => {
            try {
                setLoadingConvos(true);
                const data = await getConversations();
                setConversations(data || []);
            } catch (err) {
                console.error('Failed to load conversations:', err);
            } finally {
                setLoadingConvos(false);
            }
        };
        load();

        // Connect SignalR
        let cleanupConn = () => {};
        let isCancelled = false;

        const setupEvents = async () => {
            if (isCancelled) return;
            const conn = await connectToChat();
            if (isCancelled || !conn) return;

            const handleMsg = (msg: ChatMessageDto) => {
                setMessages(prev => [...prev, msg]);
                // Update conversation list
                setConversations(prev => {
                    const cid = msg.isFromAdmin ? msg.receiverId : msg.senderId;
                    if (!cid) return prev;
                    const exists = prev.find(c => c.userId === cid);
                    if (exists) {
                        return prev.map(c => c.userId === cid
                            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.sentAt, unreadCount: c.unreadCount + (msg.isFromAdmin ? 0 : 1) }
                            : c
                        ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
                    }
                    return [{ userId: cid, userName: msg.senderName, lastMessage: msg.content, lastMessageAt: msg.sentAt, unreadCount: 1 }, ...prev];
                });
            };

            conn.on('ReceiveMessage', handleMsg);
            
            cleanupConn = () => {
                conn.off('ReceiveMessage', handleMsg);
            };
        };
        
        setupEvents();

        return () => { 
            isCancelled = true;
            cleanupConn(); 
        };
    }, []);

    // Load messages when selecting a conversation
    useEffect(() => {
        if (!selectedUserId) return;
        const load = async () => {
            try {
                setLoadingMessages(true);
                const data = await getChatHistoryWithUser(selectedUserId, 1, 100);
                setMessages((data.items || []).reverse());
            } catch (err) {
                console.error('Failed to load messages:', err);
            } finally {
                setLoadingMessages(false);
            }
        };
        load();
    }, [selectedUserId]);

    // Handle selecting a conversation - clear unread
    const handleSelectConversation = async (userId: number) => {
        setSelectedUserId(userId);
        
        // Find the conversation to check unread count
        const conversation = conversations.find(c => c.userId === userId);
        const hasUnread = conversation && conversation.unreadCount > 0;
        
        // Clear unread count in UI immediately
        setConversations(prev =>
            prev.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c)
        );
        
        // Only call API to mark as read if there are unread messages
        if (hasUnread) {
            try {
                await markAsRead(userId);
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }
    };

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
        e.target.value = '';
    };

    const handleRemovePendingImage = () => {
        if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
        setPendingImage(null);
    };

    const handleSend = async () => {
        if ((!newMessage.trim() && !pendingImage) || sending || !selectedUserId) return;
        try {
            setSending(true);

            if (pendingImage) {
                const imageUrl = await uploadChatImage(pendingImage.file);
                URL.revokeObjectURL(pendingImage.previewUrl);
                setPendingImage(null);
                const result = await sendMessage(selectedUserId, `[img]:${imageUrl}`);
                if (result) setMessages(prev => [...prev, result]);
            }

            if (newMessage.trim()) {
                const result = await sendMessage(selectedUserId, newMessage.trim());
                if (result) setMessages(prev => [...prev, result]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Failed to send:', err);
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
            return <img src={src} alt="Image" className="admin-chat-msg-image" />;
        }
        return <p>{content}</p>;
    };

    const formatTime = (dateStr: string) => {
        const utcStr = (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.includes('T'))) ? dateStr : dateStr + 'Z';
        return new Date(utcStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const utcStr = (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.includes('T'))) ? dateStr : dateStr + 'Z';
        return new Date(utcStr).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    };

    const selectedConvo = conversations.find(c => c.userId === selectedUserId);

    return (
        <AdminLayout title="Chat">
            <div className="admin-chat-container">
                {/* Conversations sidebar */}
                <div className="admin-chat-sidebar">
                    <div className="admin-chat-sidebar-header">
                        <h3>Conversations</h3>
                    </div>
                    <div className="admin-chat-convo-list">
                        {loadingConvos ? (
                            <div className="admin-chat-loading">Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div className="admin-chat-empty-convos">
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map(convo => (
                                <div
                                    key={convo.userId}
                                    className={`admin-chat-convo-item ${selectedUserId === convo.userId ? 'active' : ''}`}
                                    onClick={() => handleSelectConversation(convo.userId)}
                                >
                                    <div className="convo-avatar">
                                        {convo.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="convo-info">
                                        <div className="convo-name">{convo.userName}</div>
                                        <div className="convo-last-msg">
                                            {convo.lastMessage.startsWith('[img]:') ? '📷 Hình ảnh' : convo.lastMessage}
                                        </div>
                                    </div>
                                    <div className="convo-meta">
                                        <span className="convo-time">{formatDate(convo.lastMessageAt)}</span>
                                        {convo.unreadCount > 0 && (
                                            <span className="convo-unread">{convo.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat area */}
                <div className="admin-chat-main">
                    {!selectedUserId ? (
                        <div className="admin-chat-no-selection">
                            <span className="material-symbols-outlined">forum</span>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    ) : (
                        <>
                            <div className="admin-chat-main-header">
                                <div className="admin-chat-main-avatar">
                                    {selectedConvo?.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3>{selectedConvo?.userName}</h3>
                                    <span className="admin-chat-user-id">User #{selectedUserId}</span>
                                </div>
                            </div>

                            <div className="admin-chat-messages" ref={messagesContainerRef}>
                                {loadingMessages ? (
                                    <div className="admin-chat-loading">Loading messages...</div>
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg.messageId}
                                            className={`admin-chat-msg ${msg.isFromAdmin ? 'sent' : 'received'}`}
                                        >
                                            <div className="admin-chat-msg-bubble">
                                                {renderMessageContent(msg.content)}
                                                <span className="admin-chat-msg-time">{formatTime(msg.sentAt)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {pendingImage && (
                                <div className="admin-chat-image-preview">
                                    <img src={pendingImage.previewUrl} alt="Preview" />
                                    <button className="admin-chat-image-preview-remove" onClick={handleRemovePendingImage}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            )}
                            <div className="admin-chat-input">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageSelect}
                                />
                                <button
                                    className="admin-chat-image-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={sending}
                                    title="Send image"
                                >
                                    <span className="material-symbols-outlined">image</span>
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type your reply..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button onClick={handleSend} disabled={(!newMessage.trim() && !pendingImage) || sending}>
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminChatPage;
