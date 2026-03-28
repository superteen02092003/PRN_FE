import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderDetail } from '../../hooks/useOrders';
import OrderTimeline from '../../components/order/OrderTimeline';
import CancelOrderModal from '../../components/order/CancelOrderModal';
import ReturnRequestModal from '../../components/order/ReturnRequestModal';
import { redirectToSepayCheckout } from '../../services/paymentService';
import { resolveImageUrl } from '@/utils/imageUrl';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import type { OrderStatus } from '../../types/order.types';
import './OrderPages.css';

const formatPrice = (price: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (date: string | null | undefined): string => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    }) + ' • ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
};

const statusConfig: Record<OrderStatus, { label: string; cssClass: string; dotColor: string }> = {
    PENDING: { label: 'Processing', cssClass: 'order-status--pending', dotColor: '#f59e0b' },
    CONFIRMED: { label: 'Confirmed', cssClass: 'order-status--confirmed', dotColor: '#3b82f6' },
    SHIPPED: { label: 'Shipping', cssClass: 'order-status--shipped', dotColor: '#3b82f6' },
    DELIVERED: { label: 'Delivered', cssClass: 'order-status--delivered', dotColor: '#10b981' },
    CANCELLED: { label: 'Canceled', cssClass: 'order-status--cancelled', dotColor: '#ef4444' },
};

const paymentMethodLabels: Record<string, string> = {
    COD: 'Cash on Delivery (COD)',
    SEPAY: 'SePay Transfer',
};

const paymentStatusLabels: Record<string, { label: string; cssClass: string }> = {
    COMPLETED: { label: 'Paid', cssClass: 'od-payment-paid' },
    PENDING: { label: 'Unpaid', cssClass: 'od-payment-unpaid' },
    FAILED: { label: 'Failed', cssClass: 'od-payment-unpaid' },
    EXPIRED: { label: 'Expired', cssClass: 'od-payment-unpaid' },
};

const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { order, isLoading, error, isCancelling, handleCancelOrder, refetch } = useOrderDetail(
        id ? Number(id) : undefined
    );
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="order-page-wrapper">
                    {/* Skeleton breadcrumb */}
                    <nav className="od-breadcrumb">
                        <div className="skeleton-box" style={{ width: '60px', height: '0.8rem' }} />
                        <span className="material-symbols-outlined">chevron_right</span>
                        <div className="skeleton-box" style={{ width: '50px', height: '0.8rem' }} />
                        <span className="material-symbols-outlined">chevron_right</span>
                        <div className="skeleton-box" style={{ width: '80px', height: '0.8rem' }} />
                    </nav>
                    {/* Skeleton header */}
                    <div className="od-header">
                        <div>
                            <div className="skeleton-box" style={{ width: '200px', height: '1.5rem', marginBottom: '0.5rem' }} />
                            <div className="skeleton-box" style={{ width: '160px', height: '0.8rem' }} />
                        </div>
                        <div className="skeleton-box" style={{ width: '90px', height: '1.8rem', borderRadius: '9999px' }} />
                    </div>
                    {/* Skeleton content */}
                    <div className="od-content-grid">
                        <div className="od-left-column">
                            <div className="od-card" style={{ padding: '1.5rem' }}>
                                <div className="skeleton-box" style={{ width: '120px', height: '1rem', marginBottom: '1.5rem' }} />
                                {[1, 2].map(i => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div className="skeleton-box" style={{ width: '64px', height: '64px', borderRadius: '8px', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton-box" style={{ width: '70%', height: '0.9rem', marginBottom: '0.4rem' }} />
                                            <div className="skeleton-box" style={{ width: '40%', height: '0.7rem' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="od-right-column">
                            <div className="od-card" style={{ padding: '1.5rem' }}>
                                <div className="skeleton-box" style={{ width: '100%', height: '1rem', marginBottom: '1rem' }} />
                                <div className="skeleton-box" style={{ width: '80%', height: '0.8rem', marginBottom: '0.5rem' }} />
                                <div className="skeleton-box" style={{ width: '60%', height: '0.8rem' }} />
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <Header />
                <div className="order-page-wrapper">
                    <div className="order-empty-state">
                        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error || 'Order not found'}</p>
                        <Link to="/orders">← Back to Orders</Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
    const canPay = order.payment?.status === 'PENDING' && order.payment?.paymentMethod === 'SEPAY';
    const canReturn = order.status === 'DELIVERED';
    const statusInfo = statusConfig[order.status] || statusConfig.PENDING;
    const paymentStatus = order.payment
        ? (paymentStatusLabels[order.payment.status] || paymentStatusLabels.PENDING)
        : null;

    return (
        <>
            <Header />
            <div className="order-page-wrapper">
                {/* Breadcrumbs */}
                <nav className="od-breadcrumb">
                    <Link to="/">Dashboard</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <Link to="/orders">Orders</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <span className="od-breadcrumb-current">{order.orderNumber}</span>
                </nav>

                {/* Order Header */}
                <div className="od-header">
                    <div>
                        <h2 className="od-title">Order #{order.orderNumber}</h2>
                        <p className="od-date">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="od-header-actions">
                        <span className={`od-status-badge ${statusInfo.cssClass}`}>
                            <span className="od-status-dot" style={{ background: statusInfo.dotColor, animation: order.status === 'PENDING' ? 'order-spin 2s linear infinite' : 'none' }} />
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                {/* Timeline */}
                <OrderTimeline
                    status={order.status}
                    confirmedAt={order.confirmedAt}
                    shippedAt={order.shippedAt}
                    deliveredAt={order.deliveredAt}
                    cancelledAt={order.cancelledAt}
                />

                {/* Cancel Reason */}
                {order.cancelReason && (
                    <div className="od-cancel-reason">
                        <strong>Cancellation reason:</strong> {order.cancelReason}
                    </div>
                )}

                {/* Content Grid */}
                <div className="od-content-grid">
                    {/* Left Column */}
                    <div className="od-left-column">
                        {/* Ordered Items */}
                        <div className="od-card">
                            <div className="od-card-header">
                                <h3>Ordered Items</h3>
                                <span className="od-card-header-meta">
                                    {order.items.length} Item{order.items.length !== 1 ? 's' : ''} Total
                                </span>
                            </div>
                            <div className="od-items-list">
                                {order.items.map((item) => (
                                    <div key={item.orderItemId} className="od-item">
                                        <div className="od-item-image">
                                            {item.productImageUrl ? (
                                                <img
                                                    src={resolveImageUrl(item.productImageUrl) || ''}
                                                    alt={item.productName || 'Product'}
                                                    onError={(e) => {
                                                        const img = e.target as HTMLImageElement;
                                                        img.style.display = 'none';
                                                        const parent = img.parentElement;
                                                        if (parent && !parent.querySelector('.od-item-image-placeholder')) {
                                                            const icon = document.createElement('span');
                                                            icon.className = 'material-symbols-outlined od-item-image-placeholder';
                                                            icon.style.fontSize = '28px';
                                                            icon.textContent = 'image_not_supported';
                                                            parent.appendChild(icon);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined od-item-image-placeholder" style={{ fontSize: 28 }}>
                                                    image_not_supported
                                                </span>
                                            )}
                                        </div>
                                        <div className="od-item-details">
                                            <div className="od-item-row">
                                                <Link to={`/products/${item.productId}`} className="od-item-name">
                                                    {item.productName || 'Product'}
                                                </Link>
                                                <span className="od-item-price">{formatPrice(item.subtotal)}</span>
                                            </div>
                                            <p className="od-item-sku">SKU: {item.productSku || 'N/A'}</p>
                                            <span className="od-item-qty">
                                                Qty: {String(item.quantity).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Info */}
                        {order.payment && (
                            <div className="od-card">
                                <div className="od-card-body">
                                    <h3 className="od-card-title">
                                        <span className="material-symbols-outlined">payments</span>
                                        Payment Details
                                    </h3>
                                    <div className="od-payment-grid">
                                        <div>
                                            <p className="od-payment-label">Method</p>
                                            <div className="od-payment-value">
                                                <span className="material-symbols-outlined">handshake</span>
                                                {paymentMethodLabels[order.payment.paymentMethod] || order.payment.paymentMethod}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="od-payment-label">Status</p>
                                            <div className={`od-payment-value ${paymentStatus?.cssClass || ''}`}>
                                                <span className="material-symbols-outlined">
                                                    {order.payment.status === 'COMPLETED' ? 'check_circle' : 'pending_actions'}
                                                </span>
                                                {paymentStatus?.label || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                    {order.payment.paymentReference && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <p className="od-payment-label">Reference</p>
                                            <p style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {order.payment.paymentReference}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="od-right-column">
                        {/* Shipping Destination */}
                        <div className="od-card">
                            <div className="od-card-body">
                                <h3 className="od-card-title">
                                    <span className="material-symbols-outlined">location_on</span>
                                    Shipping Destination
                                </h3>
                                <p className="od-shipping-name">{order.customerName}</p>
                                {order.shippingAddress && (
                                    <p className="od-shipping-line">{order.shippingAddress}</p>
                                )}
                                {order.customerEmail && (
                                    <p className="od-shipping-line">{order.customerEmail}</p>
                                )}
                                {order.customerPhone && (
                                    <div className="od-shipping-phone">
                                        <span className="material-symbols-outlined">call</span>
                                        {order.customerPhone}
                                    </div>
                                )}
                                {order.trackingNumber && (
                                    <div className="od-tracking-box">
                                        <p className="od-tracking-label">Tracking Number</p>
                                        <p className="od-tracking-number">{order.trackingNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="od-card">
                            <div className="od-summary-header">
                                <h3>
                                    <span className="material-symbols-outlined">receipt_long</span>
                                    Order Summary
                                </h3>
                            </div>
                            <div className="od-summary-body">
                                <div className="od-summary-row">
                                    <span>Subtotal ({order.items.length} items)</span>
                                    <span>{formatPrice(order.subtotalAmount)}</span>
                                </div>
                                <div className="od-summary-row">
                                    <span>Shipping</span>
                                    {order.shippingFee && order.shippingFee > 0 ? (
                                        <span>{formatPrice(order.shippingFee)}</span>
                                    ) : (
                                        <span className="od-summary-free">FREE</span>
                                    )}
                                </div>
                                {order.discountAmount != null && order.discountAmount > 0 && (
                                    <div className="od-summary-row">
                                        <span>Discount {order.coupon ? `(${order.coupon.code})` : ''}</span>
                                        <span className="od-summary-discount">-{formatPrice(order.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="od-summary-total">
                                    <span className="od-summary-total-label">Total</span>
                                    <span className="od-summary-total-value">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                            <div className="od-summary-footer">
                                SECURE TRANSACTION ENCRYPTED VIA STEM-SHIELD
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <div className="od-card">
                                <div className="od-card-body">
                                    <h3 className="od-card-title">
                                        <span className="material-symbols-outlined">sticky_note_2</span>
                                        Notes
                                    </h3>
                                    <p className="od-notes-text">{order.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="od-action-bar">
                <div className="od-action-bar-inner">
                    {canCancel ? (
                        <button className="od-btn-cancel" onClick={() => setShowCancelModal(true)}>
                            <span className="material-symbols-outlined">cancel</span>
                            Huỷ đơn hàng
                        </button>
                    ) : canReturn ? (
                        <button className="od-btn-return" onClick={() => setShowReturnModal(true)}>
                            <span className="material-symbols-outlined">undo</span>
                            Yêu cầu Trả / Đổi hàng
                        </button>
                    ) : (
                        <div />
                    )}
                    <div className="od-action-right">
                        <Link to="/orders" className="od-btn-support" style={{ textDecoration: 'none' }}>
                            <span className="material-symbols-outlined">arrow_back</span>
                            Quay lại đơn hàng
                        </Link>
                        {canPay && (
                            <button className="od-btn-pay" onClick={() => redirectToSepayCheckout(order.orderId)}>
                                <span className="material-symbols-outlined">payment</span>
                                Thanh toán ngay
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <CancelOrderModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelOrder}
                isCancelling={isCancelling}
                orderNumber={order.orderNumber}
            />

            {/* Return/Exchange Modal */}
            <ReturnRequestModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                orderId={order.orderId}
                orderNumber={order.orderNumber}
                onSuccess={refetch}
            />

            <Footer />
        </>
    );
};

export default OrderDetailPage;
