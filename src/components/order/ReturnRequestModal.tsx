import { useState } from 'react';
import { createReturnRequest } from '@/services/returnService';
import type { ReturnType } from '@/types/return.types';

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    orderNumber: string;
    onSuccess?: () => void;
}

const ReturnRequestModal = ({ isOpen, onClose, orderId, orderNumber, onSuccess }: ReturnRequestModalProps) => {
    const [type, setType] = useState<ReturnType>('RETURN');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const quickReasons = [
        'Product is defective / damaged',
        'Product does not match description',
        'Received wrong product',
        'Quality not as expected',
    ];

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Please enter a reason for your request');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await createReturnRequest({ orderId, type, reason });
            setReason('');
            setType('RETURN');
            onSuccess?.();
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'An error occurred, please try again');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="cancel-modal-backdrop" onClick={onClose} />
            <div className="cancel-modal-container">
                <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="cancel-modal-header">
                        <div className="cancel-modal-header-top">
                            <div className="cancel-modal-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                                <span className="material-symbols-outlined">undo</span>
                            </div>
                            <div>
                                <h3 className="cancel-modal-title">Return / Exchange Request</h3>
                                <p className="cancel-modal-order">#{orderNumber}</p>
                            </div>
                        </div>
                        <p className="cancel-modal-desc">
                            Please select a request type and provide a detailed reason.
                        </p>
                    </div>

                    <div className="cancel-modal-body">
                        {/* Type selector */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                className={`cancel-quick-btn ${type === 'RETURN' ? 'cancel-quick-btn--active' : ''}`}
                                onClick={() => setType('RETURN')}
                                style={{ flex: 1 }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>keyboard_return</span>
                                Return & Refund
                            </button>
                            <button
                                type="button"
                                className={`cancel-quick-btn ${type === 'EXCHANGE' ? 'cancel-quick-btn--active' : ''}`}
                                onClick={() => setType('EXCHANGE')}
                                style={{ flex: 1 }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>swap_horiz</span>
                                Exchange Product
                            </button>
                        </div>

                        {/* Quick reasons */}
                        <div className="cancel-modal-quick-reasons">
                            {quickReasons.map((qr) => (
                                <button
                                    key={qr}
                                    type="button"
                                    onClick={() => { setReason(qr); setError(''); }}
                                    className={`cancel-quick-btn ${reason === qr ? 'cancel-quick-btn--active' : ''}`}
                                >
                                    {qr}
                                </button>
                            ))}
                        </div>

                        {/* Textarea */}
                        <div>
                            <textarea
                                value={reason}
                                onChange={(e) => { setReason(e.target.value); setError(''); }}
                                placeholder="Describe the reason for your return/exchange request..."
                                className={`cancel-modal-textarea ${error ? 'cancel-modal-textarea--error' : ''}`}
                                rows={3}
                            />
                            {error && <p className="cancel-modal-error">{error}</p>}
                        </div>
                    </div>

                    <div className="cancel-modal-footer">
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            className="cancel-modal-btn-keep"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="cancel-modal-btn-confirm"
                            style={{ background: '#ea580c' }}
                        >
                            {submitting ? (
                                <>
                                    <div className="order-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReturnRequestModal;
