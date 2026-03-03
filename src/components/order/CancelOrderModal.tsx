import { useState } from 'react';

interface CancelOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<boolean>;
    isCancelling: boolean;
    orderNumber: string;
}

const CancelOrderModal = ({ isOpen, onClose, onConfirm, isCancelling, orderNumber }: CancelOrderModalProps) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const quickReasons = [
        'Changed my mind',
        'Found a better price',
        'Ordered wrong item',
        'Want to modify order',
    ];

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Please enter a cancellation reason');
            return;
        }
        const success = await onConfirm(reason);
        if (success) {
            setReason('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="cancel-modal-backdrop" onClick={onClose} />

            {/* Modal */}
            <div className="cancel-modal-container">
                <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="cancel-modal-header">
                        <div className="cancel-modal-header-top">
                            <div className="cancel-modal-icon">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <div>
                                <h3 className="cancel-modal-title">Cancel Order</h3>
                                <p className="cancel-modal-order">#{orderNumber}</p>
                            </div>
                        </div>
                        <p className="cancel-modal-desc">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                    </div>

                    {/* Body */}
                    <div className="cancel-modal-body">
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
                                placeholder="Enter cancellation reason..."
                                className={`cancel-modal-textarea ${error ? 'cancel-modal-textarea--error' : ''}`}
                                rows={3}
                            />
                            {error && <p className="cancel-modal-error">{error}</p>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="cancel-modal-footer">
                        <button
                            onClick={onClose}
                            disabled={isCancelling}
                            className="cancel-modal-btn-keep"
                        >
                            No, Keep Order
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isCancelling}
                            className="cancel-modal-btn-confirm"
                        >
                            {isCancelling ? (
                                <>
                                    <div className="order-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    Cancelling...
                                </>
                            ) : (
                                'Confirm Cancel'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CancelOrderModal;
