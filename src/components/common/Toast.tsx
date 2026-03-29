import { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
    };

    return (
        <div className={`toast toast--${type}`}>
            <span className="material-symbols-outlined toast-icon">
                {icons[type]}
            </span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
    );
};

export default Toast;
