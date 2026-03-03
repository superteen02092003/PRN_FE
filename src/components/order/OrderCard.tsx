import { Link } from 'react-router-dom';
import type { OrderResponseDto, OrderStatus } from '../../types/order.types';

interface OrderCardProps {
    order: OrderResponseDto;
}

const formatPrice = (price: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (date: string | null): string => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const statusConfig: Record<OrderStatus, { label: string; cssClass: string }> = {
    PENDING: { label: 'Processing', cssClass: 'order-status--pending' },
    CONFIRMED: { label: 'Confirmed', cssClass: 'order-status--confirmed' },
    SHIPPED: { label: 'Shipping', cssClass: 'order-status--shipped' },
    DELIVERED: { label: 'Delivered', cssClass: 'order-status--delivered' },
    CANCELLED: { label: 'Canceled', cssClass: 'order-status--cancelled' },
};

const paymentMethodLabels: Record<string, string> = {
    COD: 'COD',
    SEPAY: 'SePay',
};

const OrderCard = ({ order }: OrderCardProps) => {
    const status = statusConfig[order.status as OrderStatus] || statusConfig.PENDING;

    return (
        <div className="order-card">
            {/* Card Body */}
            <div className="order-card__body">
                {/* Header: Order Number + Status */}
                <div className="order-card__header">
                    <div>
                        <Link to={`/orders/${order.orderId}`} className="order-card__order-number">
                            Order #{order.orderNumber}
                        </Link>
                        <div className="order-card__date">
                            <span className="material-symbols-outlined">calendar_today</span>
                            {formatDate(order.createdAt)}
                        </div>
                    </div>
                    <span className={`order-card__status ${status.cssClass}`}>
                        <span className="order-card__status-dot" />
                        {status.label}
                    </span>
                </div>

                {/* Content: Thumbnail + Info */}
                <div className="order-card__content">
                    {/* Thumbnail placeholder — no image in list API */}
                    <div className="order-card__thumbnail">
                        <svg className="order-card__thumbnail-placeholder" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <div className="order-card__info">
                        <p className="order-card__items-text">
                            {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                            {order.paymentMethod && ` · ${paymentMethodLabels[order.paymentMethod] || order.paymentMethod}`}
                        </p>
                        {order.customerName && (
                            <p className="order-card__meta-text">
                                {order.customerName}
                                {order.customerPhone && ` · ${order.customerPhone}`}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Footer */}
            <div className="order-card__footer">
                <div className="order-card__total">
                    <span className="order-card__total-label">Total Price</span>
                    <span className="order-card__total-value">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="order-card__actions">
                    <Link to={`/orders/${order.orderId}`} className="order-card__btn-secondary">
                        View Details
                    </Link>
                    <Link to="/products" className="order-card__btn-primary">
                        Reorder
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
