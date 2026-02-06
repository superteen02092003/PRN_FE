import { useState } from 'react';
import type { AppliedCouponDto, CouponValidationResult } from '@/types/cart.types';
import './CouponInput.css';

interface CouponInputProps {
    appliedCoupon: AppliedCouponDto | null;
    onApplyCoupon: (code: string) => Promise<CouponValidationResult | null>;
    onRemoveCoupon?: () => void;
    disabled?: boolean;
}

const CouponInput: React.FC<CouponInputProps> = ({
    appliedCoupon,
    onApplyCoupon,
    onRemoveCoupon,
    disabled = false,
}) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleApply = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await onApplyCoupon(couponCode.trim());

        if (result) {
            if (result.isValid) {
                setCouponCode('');
                setIsExpanded(false);
            } else {
                setError(result.message || 'Invalid coupon code');
            }
        } else {
            setError('Failed to validate coupon');
        }

        setLoading(false);
    };

    const handleRemove = () => {
        onRemoveCoupon?.();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleApply();
        }
    };

    // If coupon is already applied
    if (appliedCoupon) {
        return (
            <div className="coupon-applied">
                <div className="coupon-applied__info">
                    <span className="material-symbols-outlined">local_offer</span>
                    <div className="coupon-applied__details">
                        <span className="coupon-code">{appliedCoupon.couponCode}</span>
                        <span className="coupon-discount">
                            {appliedCoupon.discountType === 'PERCENTAGE'
                                ? `${appliedCoupon.discountValue}% off`
                                : `${new Intl.NumberFormat('vi-VN').format(appliedCoupon.discountValue)}₫ off`}
                        </span>
                    </div>
                </div>
                <button
                    className="coupon-applied__remove"
                    onClick={handleRemove}
                    disabled={disabled}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        );
    }

    return (
        <div className="coupon-input">
            <button
                className="coupon-input__toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="material-symbols-outlined">confirmation_number</span>
                Have a coupon code?
                <span className="material-symbols-outlined expand-icon">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {isExpanded && (
                <div className="coupon-input__form">
                    <div className="coupon-input__field">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setError(null);
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter coupon code"
                            disabled={disabled || loading}
                            className={error ? 'has-error' : ''}
                        />
                        <button
                            onClick={handleApply}
                            disabled={disabled || loading || !couponCode.trim()}
                            className="apply-btn"
                        >
                            {loading ? (
                                <div className="loading-spinner-small" />
                            ) : (
                                'Apply'
                            )}
                        </button>
                    </div>
                    {error && <p className="coupon-input__error">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default CouponInput;
