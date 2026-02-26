import type { ValidateCheckoutResponse } from '../../types/order.types';

interface OrderReviewProps {
    validation: ValidateCheckoutResponse | null;
    isValidating: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
    paymentMethod: string;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
};

const OrderReview = ({ validation, isValidating, isSubmitting, onSubmit, paymentMethod }: OrderReviewProps) => {
    const summary = validation?.summary;
    const items = validation?.cartItems || [];
    const coupon = validation?.coupon;
    const hasStockErrors = validation?.stockErrors && validation.stockErrors.length > 0;
    const canSubmit = !isSubmitting && !isValidating && !hasStockErrors && validation?.isValid;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title */}
            <h3 className="order-summary-title">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Order Summary
            </h3>

            {/* Cart Items */}
            <div className="custom-scrollbar" style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((item) => (
                    <div key={item.cartItemId} className="order-item">
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="order-item__name">{item.productName}</p>
                            <p className="order-item__meta">
                                {formatPrice(item.unitPrice)} × {item.quantity}
                            </p>
                        </div>
                        <p className="order-item__price">{formatPrice(item.itemTotal)}</p>
                    </div>
                ))}
            </div>

            {/* Stock Errors */}
            {hasStockErrors && (
                <div className="stock-error-box">
                    <p className="stock-error-title">⚠️ Stock Unavailable</p>
                    {validation?.stockErrors?.map((err) => (
                        <p key={err.productId} className="stock-error-item">
                            {err.productName}: Requested {err.requestedQuantity}, only {err.availableQuantity} left
                        </p>
                    ))}
                </div>
            )}

            {/* Coupon */}
            {coupon && (
                <div className="coupon-strip">
                    <svg className="coupon-strip__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    <span className="coupon-strip__text">
                        Coupon applied: <strong>{coupon.couponCode}</strong>
                    </span>
                    <span className="coupon-strip__amount">
                        -{formatPrice(coupon.discountAmount)}
                    </span>
                </div>
            )}

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <div className="order-summary-row">
                    <span className="order-summary-row__label">Subtotal</span>
                    <span className="order-summary-row__value">
                        {summary ? formatPrice(summary.subtotal) : '—'}
                    </span>
                </div>
                <div className="order-summary-row">
                    <span className="order-summary-row__label">Shipping</span>
                    <span className={summary && summary.shippingFee === 0 ? 'order-summary-row__value--green' : 'order-summary-row__value'}>
                        {summary ? (summary.shippingFee === 0 ? 'Free' : formatPrice(summary.shippingFee)) : '—'}
                    </span>
                </div>
                {summary && summary.discount > 0 && (
                    <div className="order-summary-row">
                        <span className="order-summary-row__value--green">Discount</span>
                        <span className="order-summary-row__value--green">
                            -{formatPrice(summary.discount)}
                        </span>
                    </div>
                )}

                {/* Total */}
                <div className="order-total-row">
                    <span className="order-total-label">Total</span>
                    <span className="order-total-value">
                        {summary ? formatPrice(summary.total) : '—'}
                    </span>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className={`checkout-submit-btn ${canSubmit ? 'checkout-submit-btn--active' : 'checkout-submit-btn--disabled'}`}
            >
                {isSubmitting ? (
                    <>
                        <svg style={{ animation: 'checkout-spin 0.7s linear infinite' }} width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <circle opacity={0.25} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        {paymentMethod === 'SEPAY' ? 'PAY VIA SEPAY' : 'PLACE ORDER'}
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </>
                )}
            </button>

            {/* Security Note */}
            <div className="checkout-security-note">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                256-bit SSL Secure Payment
            </div>
        </div>
    );
};

export default OrderReview;
