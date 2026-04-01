import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminOrderDetail, updateOrderStatus, updatePaymentStatus } from '@/services/adminService';
import type { AdminOrderDetailResponse } from '@/types/admin.types';
import { toast } from 'react-toastify';

const STATUS_FLOW: Record<string, { icon: string; color: string }> = {
    PENDING: { icon: 'schedule', color: '#f59e0b' },
    CONFIRMED: { icon: 'check_circle', color: '#3b82f6' },
    SHIPPED: { icon: 'local_shipping', color: '#6366f1' },
    DELIVERED: { icon: 'verified', color: '#22c55e' },
    CANCELLED: { icon: 'cancel', color: '#ef4444' },
};

const AdminOrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<AdminOrderDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');
    const [showShipFields, setShowShipFields] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAdminOrderDetail(Number(id));
            setOrder(result);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load order');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === 'SHIPPED' && !showShipFields) {
            setShowShipFields(true);
            return;
        }

        try {
            setUpdating(true);
            await updateOrderStatus(Number(id), {
                newStatus,
                note: statusNote || undefined,
                trackingNumber: trackingNumber || undefined,
                carrier: carrier || undefined,
            });
            toast.success(`Order status updated to ${newStatus}`);
            setStatusNote('');
            setTrackingNumber('');
            setCarrier('');
            setShowShipFields(false);
            fetchOrder();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handlePaymentStatusUpdate = async (newPaymentStatus: string) => {
        try {
            setUpdating(true);
            await updatePaymentStatus(Number(id), { newPaymentStatus });
            toast.success(`Payment status updated to ${newPaymentStatus}`);
            fetchOrder();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update payment');
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <AdminLayout title="Order Detail">
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                    <span className="admin-loading-text">Loading order...</span>
                </div>
            </AdminLayout>
        );
    }

    if (!order) {
        return (
            <AdminLayout title="Order Detail">
                <div className="admin-empty">
                    <span className="material-symbols-outlined">error</span>
                    <p>Order not found</p>
                </div>
            </AdminLayout>
        );
    }

    const statusInfo = STATUS_FLOW[order.status || ''] || { icon: 'help', color: '#6b7280' };

    return (
        <AdminLayout title={`Order ${order.orderNumber}`}>
            {/* Back Button + Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button className="admin-btn ghost" onClick={() => navigate('/admin/orders')}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                    Back to Orders
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="material-symbols-outlined" style={{ color: statusInfo.color, fontSize: '28px' }}>{statusInfo.icon}</span>
                    <span className={`status-badge ${(order.status || '').toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Info Grid */}
            <div className="admin-detail-grid">
                {/* Customer Info */}
                <div className="admin-detail-section">
                    <h3><span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'text-bottom', marginRight: '8px' }}>person</span>Customer Info</h3>
                    <div className="admin-detail-row"><span className="admin-detail-label">Name</span><span className="admin-detail-value">{order.customerName || '—'}</span></div>
                    <div className="admin-detail-row"><span className="admin-detail-label">Email</span><span className="admin-detail-value">{order.customerEmail || '—'}</span></div>
                    <div className="admin-detail-row"><span className="admin-detail-label">Phone</span><span className="admin-detail-value">{order.customerPhone || '—'}</span></div>
                </div>

                {/* Shipping Info */}
                <div className="admin-detail-section">
                    <h3><span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'text-bottom', marginRight: '8px' }}>local_shipping</span>Shipping Info</h3>
                    <div className="admin-detail-row"><span className="admin-detail-label">Address</span><span className="admin-detail-value">{order.streetAddress || order.shippingAddress || '—'}</span></div>
                    <div className="admin-detail-row"><span className="admin-detail-label">Ward</span><span className="admin-detail-value">{order.ward || '—'}</span></div>
                    <div className="admin-detail-row"><span className="admin-detail-label">District</span><span className="admin-detail-value">{order.district || '—'}</span></div>
                    <div className="admin-detail-row"><span className="admin-detail-label">Province</span><span className="admin-detail-value">{order.province || '—'}</span></div>
                    {order.trackingNumber && <div className="admin-detail-row"><span className="admin-detail-label">Tracking #</span><span className="admin-detail-value">{order.trackingNumber}</span></div>}
                    {order.carrier && <div className="admin-detail-row"><span className="admin-detail-label">Carrier</span><span className="admin-detail-value">{order.carrier}</span></div>}
                </div>

                {/* Payment Info */}
                <div className="admin-detail-section">
                    <h3><span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'text-bottom', marginRight: '8px' }}>payment</span>Payment</h3>
                    <div className="admin-detail-row"><span className="admin-detail-label">Method</span><span className="admin-detail-value">{order.payment?.paymentMethod || '—'}</span></div>
                    <div className="admin-detail-row"><span className="admin-detail-label">Status</span><span className="admin-detail-value"><span className={`status-badge ${(order.payment?.paymentStatus || '').toLowerCase()}`}>{order.payment?.paymentStatus || '—'}</span></span></div>
                    <div className="admin-detail-row"><span className="admin-detail-label">Amount</span><span className="admin-detail-value">{formatCurrency(order.payment?.amount || 0)}</span></div>
                    {order.payment?.paymentDate && <div className="admin-detail-row"><span className="admin-detail-label">Paid At</span><span className="admin-detail-value">{formatDate(order.payment.paymentDate)}</span></div>}
                    {order.payment?.paymentReference && <div className="admin-detail-row"><span className="admin-detail-label">Reference</span><span className="admin-detail-value" style={{ fontFamily: 'monospace' }}>{order.payment.paymentReference}</span></div>}

                    {/* Payment Status Actions */}
                    {order.payment?.paymentStatus === 'PENDING' && (
                        <div className="admin-status-actions">
                            <button className="admin-btn success" onClick={() => handlePaymentStatusUpdate('PAID')} disabled={updating}>
                                Mark as Paid
                            </button>
                        </div>
                    )}
                </div>

                {/* Timestamps */}
                <div className="admin-detail-section">
                    <h3><span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'text-bottom', marginRight: '8px' }}>schedule</span>Timeline</h3>
                    <div className="admin-detail-row"><span className="admin-detail-label">Created</span><span className="admin-detail-value">{formatDate(order.createdAt)}</span></div>
                    {order.confirmedAt && <div className="admin-detail-row"><span className="admin-detail-label">Confirmed</span><span className="admin-detail-value">{formatDate(order.confirmedAt)}</span></div>}
                    {order.shippedAt && <div className="admin-detail-row"><span className="admin-detail-label">Shipped</span><span className="admin-detail-value">{formatDate(order.shippedAt)}</span></div>}
                    {order.deliveredAt && <div className="admin-detail-row"><span className="admin-detail-label">Delivered</span><span className="admin-detail-value">{formatDate(order.deliveredAt)}</span></div>}
                    {order.cancelledAt && <div className="admin-detail-row"><span className="admin-detail-label">Cancelled</span><span className="admin-detail-value" style={{ color: '#ef4444' }}>{formatDate(order.cancelledAt)}</span></div>}
                    {order.cancelReason && <div className="admin-detail-row"><span className="admin-detail-label">Cancel Reason</span><span className="admin-detail-value" style={{ color: '#ef4444' }}>{order.cancelReason}</span></div>}
                </div>
            </div>

            {/* Order Items */}
            <div className="admin-card" style={{ marginBottom: '24px' }}>
                <h3 className="admin-chart-title" style={{ marginBottom: '16px' }}>Order Items</h3>
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Unit Price</th>
                                <th>Qty</th>
                                <th>Subtotal</th>
                                <th>Serial Numbers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.orderItemId}>
                                    <td>
                                        {item.productImageUrl ? (
                                            <img src={item.productImageUrl} alt={item.productName || ''} className="admin-product-image" />
                                        ) : (
                                            <div className="admin-product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#9ca3af' }}>image</span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{item.productName || '—'}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{item.productSku || '—'}</td>
                                    <td>{formatCurrency(item.unitPrice)}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e5e7eb' }}>
                    <div style={{ minWidth: '250px' }}>
                        <div className="admin-detail-row"><span className="admin-detail-label">Subtotal</span><span className="admin-detail-value">{formatCurrency(order.subtotalAmount)}</span></div>
                        {order.shippingFee !== null && <div className="admin-detail-row"><span className="admin-detail-label">Shipping</span><span className="admin-detail-value">{formatCurrency(order.shippingFee || 0)}</span></div>}
                        {(order.discountAmount ?? 0) > 0 && <div className="admin-detail-row"><span className="admin-detail-label">Discount</span><span className="admin-detail-value" style={{ color: '#16a34a' }}>-{formatCurrency(order.discountAmount || 0)}</span></div>}
                        <div className="admin-detail-row" style={{ fontWeight: 700, fontSize: '16px' }}><span className="admin-detail-label">Total</span><span className="admin-detail-value">{formatCurrency(order.totalAmount)}</span></div>
                    </div>
                </div>
            </div>

            {/* Status Transition Actions */}
            {order.allowedStatusTransitions.length > 0 && (
                <div className="admin-card">
                    <h3 className="admin-chart-title" style={{ marginBottom: '16px' }}>Update Order Status</h3>

                    {/* Ship fields */}
                    {showShipFields && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <input className="admin-form-input" placeholder="Tracking Number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} style={{ flex: '1', minWidth: '200px' }} />
                            <input className="admin-form-input" placeholder="Carrier (e.g. GHN, GHTK)" value={carrier} onChange={e => setCarrier(e.target.value)} style={{ flex: '1', minWidth: '200px' }} />
                        </div>
                    )}

                    {/* Note */}
                    <input className="admin-form-input" placeholder="Add a note (optional)" value={statusNote} onChange={e => setStatusNote(e.target.value)} style={{ width: '100%', marginBottom: '12px' }} />

                    <div className="admin-status-actions">
                        {order.allowedStatusTransitions.map((status) => {
                            const info = STATUS_FLOW[status] || { icon: 'help', color: '#6b7280' };
                            return (
                                <button
                                    key={status}
                                    className="admin-btn"
                                    style={{ backgroundColor: `${info.color}20`, color: info.color, border: `1px solid ${info.color}40` }}
                                    onClick={() => handleStatusUpdate(status)}
                                    disabled={updating}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{info.icon}</span>
                                    {status === 'CONFIRMED' ? 'Confirm' : status === 'SHIPPED' ? 'Ship' : status === 'DELIVERED' ? 'Mark Delivered' : status === 'CANCELLED' ? 'Cancel' : status}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrderDetailPage;
