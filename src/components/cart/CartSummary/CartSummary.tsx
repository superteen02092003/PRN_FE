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

    return (
        <div className="cart-summary">
            <h3 className="cart-summary__title">Order Summary</h3>

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
                    <span className="summary-label">Shipping Fee</span>
                    <span className="summary-value">
                        {summary.shippingFee > 0 ? formatPrice(summary.shippingFee) : 'Free'}
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
