import type { ReactNode } from 'react';
import type { PaymentMethodDto, PaymentMethodType } from '../../types/order.types';

interface PaymentMethodSelectorProps {
    methods: PaymentMethodDto[];
    selected: PaymentMethodType;
    onSelect: (method: PaymentMethodType) => void;
    isLoading: boolean;
}

const paymentIcons: Record<string, ReactNode> = {
    COD: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
    ),
    SEPAY: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    ),
};

const paymentDescriptions: Record<string, string> = {
    COD: 'Pay when your items arrive',
    SEPAY: 'Transfer directly from your bank account',
};

const PaymentMethodSelector = ({ methods, selected, onSelect, isLoading }: PaymentMethodSelectorProps) => {
    const displayMethods = methods.length > 0
        ? methods
        : [
            { code: 'COD', name: 'Cash on Delivery', description: 'COD', isActive: true },
            { code: 'SEPAY', name: 'Bank Transfer', description: 'Online Payment', isActive: true },
        ];

    return (
        <div>
            {/* Section Header */}
            <div className="checkout-section-header">
                <div className="checkout-section-badge">2</div>
                <h2 className="checkout-section-title">Payment Method</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {displayMethods.filter(m => m.isActive).map((method) => {
                    const isSelected = selected === method.code;
                    return (
                        <button
                            key={method.code}
                            type="button"
                            onClick={() => onSelect(method.code as PaymentMethodType)}
                            disabled={isLoading}
                            className={`payment-option ${isSelected ? 'payment-option--selected' : ''}`}
                            style={{ opacity: isLoading ? 0.5 : 1 }}
                        >
                            <div className="payment-option__left">
                                {/* Icon */}
                                <div className={`payment-option__icon ${isSelected ? 'payment-option__icon--selected' : 'payment-option__icon--default'}`}>
                                    {paymentIcons[method.code] || paymentIcons.COD}
                                </div>

                                {/* Text */}
                                <div style={{ textAlign: 'left' }}>
                                    <p className="payment-option__name">{method.name}</p>
                                    <p className="payment-option__desc">
                                        {paymentDescriptions[method.code] || method.description}
                                    </p>
                                </div>

                                {/* Badge */}
                                {method.code === 'SEPAY' && (
                                    <span className="payment-badge">Fast</span>
                                )}
                            </div>

                            {/* Radio */}
                            <div className={`payment-radio ${isSelected ? 'payment-radio--selected' : ''}`}>
                                {isSelected && <div className="payment-radio__dot" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;
