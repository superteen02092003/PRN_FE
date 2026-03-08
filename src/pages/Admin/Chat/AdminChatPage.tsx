import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { connectToChat, disconnectChat, getConversations, getChatHistoryWithUser, sendMessage } from '@/services/chatService';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

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
        connectToChat((msg) => {
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
        });

        return () => { disconnectChat(); };
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

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending || !selectedUserId) return;
        try {
            setSending(true);
            const result = await sendMessage(selectedUserId, newMessage.trim());
            if (result) {
                setMessages(prev => [...prev, result]);
            }
            setNewMessage('');
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

    const formatTime = (dateStr: string) =>
        new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });

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
                                    onClick={() => setSelectedUserId(convo.userId)}
                                >
                                    <div className="convo-avatar">
                                        {convo.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="convo-info">
                                        <div className="convo-name">{convo.userName}</div>
                                        <div className="convo-last-msg">{convo.lastMessage}</div>
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
                                                <p>{msg.content}</p>
                                                <span className="admin-chat-msg-time">{formatTime(msg.sentAt)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="admin-chat-input">
                                <input
                                    type="text"
                                    placeholder="Type your reply..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button onClick={handleSend} disabled={!newMessage.trim() || sending}>
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
