import { useNavigate } from 'react-router-dom';
import type { CartSummaryDto, AppliedCouponDto } from '@/types/cart.types';
import './CartSummary.css';

interface CartSummaryProps {
    summary: CartSummaryDto;
    appliedCoupon: AppliedCouponDto | null;
    onCheckout?: () => void;
    loading?: boolean;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const CartSummary: React.FC<CartSummaryProps> = ({
    summary,
    appliedCoupon,
    onCheckout,
    loading = false,
}) => {
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (onCheckout) {
            onCheckout();
        } else {
            navigate('/checkout');
        }
    };

    const FREE_SHIPPING_THRESHOLD = 500_000;
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - summary.subtotal);
    const progress = Math.min(100, (summary.subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    const isFreeShipping = summary.subtotal >= FREE_SHIPPING_THRESHOLD;

    return (
        <div className="cart-summary">
            <h3 className="cart-summary__title">Order Summary</h3>

            {/* Free Shipping Banner */}
            <div className={`free-shipping-banner ${isFreeShipping ? 'free-shipping-banner--achieved' : ''}`}>
                <div className="free-shipping-banner__text">
                    {isFreeShipping ? (
                        <>
                            <span className="material-symbols-outlined">local_shipping</span>
                            You qualify for <strong>free shipping</strong>!
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">local_shipping</span>
                            Add <strong>{formatPrice(remaining)}</strong> more for free shipping
                        </>
                    )}
                </div>
                <div className="free-shipping-progress">
                    <div className="free-shipping-progress__bar" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="cart-summary__body">
                {/* Subtotal */}
                <div className="summary-row">
                    <span className="summary-label">
                        Subtotal ({summary.totalItems} items)
                    </span>
                    <span className="summary-value">{formatPrice(summary.subtotal)}</span>
                </div>

                {/* Shipping */}
                <div className="summary-row">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value summary-value--shipping">
                        {isFreeShipping ? (
                            <span className="shipping-free-label">Free</span>
                        ) : (
                            formatPrice(summary.shippingFee)
                        )}
                    </span>
                </div>

                {/* Discount */}
                {summary.discount > 0 && (
                    <div className="summary-row summary-row--discount">
                        <span className="summary-label">
                            <span className="material-symbols-outlined">sell</span>
                            Discount
                            {appliedCoupon && (
                                <span className="coupon-code">({appliedCoupon.couponCode})</span>
                            )}
                        </span>
                        <span className="summary-value">-{formatPrice(summary.discount)}</span>
                    </div>
                )}

                {/* Divider */}
                <div className="summary-divider" />

                {/* Total */}
                <div className="summary-row summary-row--total">
                    <span className="summary-label">Total</span>
                    <span className="summary-value">{formatPrice(summary.total)}</span>
                </div>
            </div>

            {/* Checkout Button */}
            <button
                className="cart-summary__checkout"
                onClick={handleCheckout}
                disabled={loading || summary.totalItems === 0}
            >
                {loading ? (
                    <>
                        <div className="loading-spinner-small" />
                        Processing...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">shopping_cart_checkout</span>
                        Proceed to Checkout
                    </>
                )}
            </button>

            {/* Secure Payment Note */}
            <p className="cart-summary__secure">
                <span className="material-symbols-outlined">lock</span>
                Secure payment with SSL encryption
            </p>
        </div>
    );
};

export default CartSummary;
