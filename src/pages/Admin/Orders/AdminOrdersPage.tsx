import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminOrders } from '@/services/adminService';
import type { AdminOrderResponse, AdminOrderFilter } from '@/types/admin.types';
import { toast } from 'react-toastify';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState<AdminOrderFilter>({
        pageNumber: 1,
        pageSize: 15,
    });

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAdminOrders(filter);
            setOrders(result.items);
            setTotalCount(result.totalCount);
            setTotalPages(result.totalPages);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AdminLayout title="Orders">
            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search-input">
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search by order number, customer..."
                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value || undefined, pageNumber: 1 }))}
                    />
                </div>
                <select
                    className="admin-select"
                    value={filter.status || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value || undefined, pageNumber: 1 }))}
                >
                    <option value="">All Status</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    className="admin-select"
                    value={filter.paymentMethod || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, paymentMethod: e.target.value || undefined, pageNumber: 1 }))}
                >
                    <option value="">All Payment</option>
                    <option value="COD">COD</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
                <select
                    className="admin-select"
                    value={filter.paymentStatus || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, paymentStatus: e.target.value || undefined, pageNumber: 1 }))}
                >
                    <option value="">All Payment Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="EXPIRED">Expired</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading-spinner" />
                        <span className="admin-loading-text">Loading orders...</span>
                    </div>
                ) : (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Payment Status</th>
                                        <th>Order Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.orderId}
                                            className="clickable"
                                            onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                                        >
                                            <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                                            <td>
                                                <div>{order.customerName || '—'}</div>
                                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{order.customerEmail || ''}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{order.itemCount}</td>
                                            <td style={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</td>
                                            <td>{order.paymentMethod || '—'}</td>
                                            <td>
                                                <span className={`status-badge ${(order.paymentStatus || '').toLowerCase()}`}>
                                                    {order.paymentStatus || '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${(order.status || '').toLowerCase()}`}>
                                                    {order.status || '—'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(order.createdAt)}</td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No orders found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="admin-pagination">
                            <span className="admin-pagination-info">
                                Showing {orders.length} of {totalCount} orders
                            </span>
                            <div className="admin-pagination-buttons">
                                <button
                                    className="admin-pagination-btn"
                                    disabled={filter.pageNumber === 1}
                                    onClick={() => setFilter(prev => ({ ...prev, pageNumber: (prev.pageNumber || 1) - 1 }))}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`admin-pagination-btn ${filter.pageNumber === page ? 'active' : ''}`}
                                        onClick={() => setFilter(prev => ({ ...prev, pageNumber: page }))}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    className="admin-pagination-btn"
                                    disabled={filter.pageNumber === totalPages || totalPages === 0}
                                    onClick={() => setFilter(prev => ({ ...prev, pageNumber: (prev.pageNumber || 1) + 1 }))}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrdersPage;
