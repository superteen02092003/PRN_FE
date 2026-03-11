import { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';
import api from '@/services/api';

interface BotMessage {
    id: number;
    text: string;
    isBot: boolean;
    timestamp: Date;
    source?: string; // 'faq' | 'ai' | 'fallback' | 'error'
}

const QUICK_ACTIONS = [
    { label: '📦 Shipping', question: 'What are the shipping fees?' },
    { label: '🔄 Returns', question: 'What is the return policy?' },
    { label: '🛡️ Warranty', question: 'What is the warranty policy?' },
    { label: '💳 Payment', question: 'What payment methods are available?' },
    { label: '📋 Ordering', question: 'How do I place an order?' },
];

const askChatbot = async (question: string): Promise<{ answer: string; source: string }> => {
    try {
        const response = await api.post('/chatbot/ask', { question });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return { answer: 'Sorry, unable to connect to chatbot.', source: 'error' };
    } catch {
        return { answer: 'Sorry, server is busy. Please try again later.', source: 'error' };
    }
};

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<BotMessage[]>([
        {
            id: 0,
            text: '👋 Hi there! I\'m STEM Bot — your AI assistant for STEM Store. How can I help you today?',
            isBot: true,
            timestamp: new Date(),
            source: 'faq',
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

    const sendQuestion = async (question: string) => {
        setIsTyping(true);
        const result = await askChatbot(question);
        setMessages(prev => [
            ...prev,
            { id: Date.now(), text: result.answer, isBot: true, timestamp: new Date(), source: result.source },
        ]);
        setIsTyping(false);
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
        const question = input.trim();
        setInput('');
        sendQuestion(question);
    };

    const handleQuickAction = (question: string, label: string) => {
        setMessages(prev => [
            ...prev,
            { id: Date.now(), text: label, isBot: false, timestamp: new Date() },
        ]);
        sendQuestion(question);
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
                                    <button key={a.question} onClick={() => handleQuickAction(a.question, a.label)}>
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
