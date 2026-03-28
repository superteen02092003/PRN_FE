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
            <h3 className="cart-summary__title">Tóm tắt đơn hàng</h3>

            {/* Free Shipping Banner */}
            <div className={`free-shipping-banner ${isFreeShipping ? 'free-shipping-banner--achieved' : ''}`}>
                <div className="free-shipping-banner__text">
                    {isFreeShipping ? (
                        <>
                            <span className="material-symbols-outlined">local_shipping</span>
                            Bạn được <strong>miễn phí vận chuyển</strong>!
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">local_shipping</span>
                            Mua thêm <strong>{formatPrice(remaining)}</strong> để được miễn phí ship
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
                        Tạm tính ({summary.totalItems} sản phẩm)
                    </span>
                    <span className="summary-value">{formatPrice(summary.subtotal)}</span>
                </div>

                {/* Shipping */}
                <div className="summary-row">
                    <span className="summary-label">Phí vận chuyển</span>
                    <span className="summary-value summary-value--shipping">
                        {isFreeShipping ? (
                            <span className="shipping-free-label">Miễn phí</span>
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
                            Giảm giá
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
                    <span className="summary-label">Tổng cộng</span>
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
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">shopping_cart_checkout</span>
                        Tiến hành thanh toán
                    </>
                )}
            </button>

            {/* Secure Payment Note */}
            <p className="cart-summary__secure">
                <span className="material-symbols-outlined">lock</span>
                Thanh toán bảo mật với mã hóa SSL
            </p>
        </div>
    );
};

export default CartSummary;
