import { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';

interface BotMessage {
    id: number;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
    'shipping': '📦 We offer free shipping on orders over 200.000₫! Standard delivery takes 2-5 business days. Express shipping (1-2 days) is available for 30.000₫.',
    'return': '🔄 We accept returns within 30 days of purchase. Items must be in original packaging. Contact our support team to initiate a return.',
    'warranty': '🛡️ All products come with manufacturer warranty. You can check your warranty status in the "My Warranties" section of your account.',
    'payment': '💳 We accept SePay bank transfer and Cash on Delivery (COD). All transactions are secured with STEM-Shield encryption.',
    'order': '📋 You can track your order in the "My Orders" section. We\'ll also send you email updates as your order progresses.',
    'account': '👤 You can manage your profile, view orders, and check warranties in your account dashboard. Visit "My Profile" to update your information.',
};

const QUICK_ACTIONS = [
    { label: '📦 Shipping Info', key: 'shipping' },
    { label: '🔄 Returns', key: 'return' },
    { label: '🛡️ Warranty', key: 'warranty' },
    { label: '💳 Payment', key: 'payment' },
    { label: '📋 Track Order', key: 'order' },
];

const findAnswer = (input: string): string => {
    const lower = input.toLowerCase();
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
        if (lower.includes(key)) return response;
    }
    // Fuzzy matches
    if (lower.includes('ship') || lower.includes('deliver')) return FAQ_RESPONSES.shipping;
    if (lower.includes('refund') || lower.includes('return') || lower.includes('exchange')) return FAQ_RESPONSES.return;
    if (lower.includes('warrant') || lower.includes('guarantee')) return FAQ_RESPONSES.warranty;
    if (lower.includes('pay') || lower.includes('sepay') || lower.includes('cod')) return FAQ_RESPONSES.payment;
    if (lower.includes('order') || lower.includes('track') || lower.includes('status')) return FAQ_RESPONSES.order;
    if (lower.includes('account') || lower.includes('profile') || lower.includes('password')) return FAQ_RESPONSES.account;
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('xin chào')) {
        return '👋 Hello! I\'m STEM Gear\'s assistant. How can I help you today? You can ask about shipping, returns, warranty, payment, or your orders.';
    }
    if (lower.includes('thank') || lower.includes('cảm ơn')) {
        return '😊 You\'re welcome! Is there anything else I can help with?';
    }
    return '🤔 I\'m not sure about that. For detailed help, please use our **Support Chat** to connect with a real agent, or try asking about: shipping, returns, warranty, payment, or orders.';
};

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<BotMessage[]>([
        {
            id: 0,
            text: '👋 Hi there! I\'m STEM Bot. How can I help you today?',
            isBot: true,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const addBotReply = (text: string) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { id: Date.now(), text, isBot: true, timestamp: new Date() },
            ]);
            setIsTyping(false);
        }, 600 + Math.random() * 800);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg: BotMessage = {
            id: Date.now(),
            text: input.trim(),
            isBot: false,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        const answer = findAnswer(input);
        setInput('');
        addBotReply(answer);
    };

    const handleQuickAction = (key: string) => {
        const label = QUICK_ACTIONS.find(a => a.key === key)?.label || key;
        setMessages(prev => [
            ...prev,
            { id: Date.now(), text: label, isBot: false, timestamp: new Date() },
        ]);
        addBotReply(FAQ_RESPONSES[key]);
    };

    const formatTime = (d: Date) =>
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            {/* Floating Button */}
            <button
                className={`chatbot-fab ${isOpen ? 'chatbot-fab--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chat with bot"
            >
                <span className="material-symbols-outlined chatbot-fab__icon">
                    {isOpen ? 'close' : 'smart_toy'}
                </span>
                {!isOpen && <span className="chatbot-fab__pulse" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header__avatar">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div>
                            <h4>STEM Bot</h4>
                            <span className="chatbot-header__status">
                                <span className="chatbot-header__dot" /> Online
                            </span>
                        </div>
                    </div>

                    <div className="chatbot-body">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chatbot-msg ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className="chatbot-msg__bubble">
                                    <p>{msg.text}</p>
                                    <span className="chatbot-msg__time">{formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chatbot-msg bot">
                                <div className="chatbot-msg__bubble chatbot-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />

                        {/* Quick Actions (show only at start) */}
                        {messages.length <= 1 && !isTyping && (
                            <div className="chatbot-quick-actions">
                                {QUICK_ACTIONS.map(a => (
                                    <button key={a.key} onClick={() => handleQuickAction(a.key)}>
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="chatbot-input">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                        />
                        <button onClick={handleSend} disabled={!input.trim()}>
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
