import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getDashboard, getRevenueChart } from '@/services/adminService';
import type { DashboardResponse, DailyRevenueData } from '@/types/admin.types';

const STATUS_COLORS: Record<string, string> = {
    Pending: '#f59e0b',
    Confirmed: '#3b82f6',
    Shipped: '#6366f1',
    Delivered: '#22c55e',
    Cancelled: '#ef4444',
};

type RangePreset = '7d' | '30d' | 'month' | 'year' | 'custom';

const getDateRange = (preset: RangePreset): { from: string; to: string } => {
    const now = new Date();
    
    // Helper to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // For "to" date, add 1 day to include today's data
    // Backend likely uses date >= from AND date < to (exclusive end)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const to = formatLocalDate(tomorrow);
    let from: string;

    switch (preset) {
        case '7d':
            from = formatLocalDate(new Date(now.getTime() - 7 * 86400000));
            break;
        case '30d':
            from = formatLocalDate(new Date(now.getTime() - 30 * 86400000));
            break;
        case 'month':
            from = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
            break;
        case 'year':
            from = formatLocalDate(new Date(now.getFullYear(), 0, 1));
            break;
        default:
            from = formatLocalDate(new Date(now.getTime() - 30 * 86400000));
    }
    
    return { from, to };
};

const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Revenue chart state
    const [revenueData, setRevenueData] = useState<DailyRevenueData[]>([]);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [rangePreset, setRangePreset] = useState<RangePreset>('30d');
    const [chartStatus, setChartStatus] = useState<string>('');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const result = await getDashboard();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const fetchRevenueChart = useCallback(async (from: string, to: string) => {
        try {
            setRevenueLoading(true);
            const result = await getRevenueChart(from, to, chartStatus || undefined);
            setRevenueData(result);
        } catch {
            setRevenueData([]);
        } finally {
            setRevenueLoading(false);
        }
    }, [chartStatus]);

    useEffect(() => {
        if (rangePreset === 'custom') {
            if (customFrom && customTo) {
                fetchRevenueChart(customFrom, customTo);
            }
        } else {
            const { from, to } = getDateRange(rangePreset);
            fetchRevenueChart(from, to);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rangePreset, customFrom, customTo, chartStatus, fetchRevenueChart]);

    if (loading) {
        return (
            <AdminLayout title="Dashboard">
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                    <span className="admin-loading-text">Loading dashboard...</span>
                </div>
            </AdminLayout>
        );
    }

    if (error || !data) {
        return (
            <AdminLayout title="Dashboard">
                <div className="admin-empty">
                    <span className="material-symbols-outlined">error</span>
                    <p>{error || 'Failed to load dashboard'}</p>
                </div>
            </AdminLayout>
        );
    }

    const orderChartData = [
        { name: 'Pending', value: data.orders.pendingOrders, color: STATUS_COLORS.Pending },
        { name: 'Confirmed', value: data.orders.confirmedOrders, color: STATUS_COLORS.Confirmed },
        { name: 'Shipped', value: data.orders.shippedOrders, color: STATUS_COLORS.Shipped },
        { name: 'Delivered', value: data.orders.deliveredOrders, color: STATUS_COLORS.Delivered },
        { name: 'Cancelled', value: data.orders.cancelledOrders, color: STATUS_COLORS.Cancelled },
    ].filter(item => item.value > 0);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Revenue chart summary
    const totalChartRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
    const totalChartOrders = revenueData.reduce((s, d) => s + d.orderCount, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#0e121b' }}>{formatShortDate(label)}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#2463eb' }}>
                        Revenue: {formatCurrency(payload[0]?.value ?? 0)}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#f59e0b' }}>
                        Orders: {payload[1]?.value ?? 0}
                    </p>
                </div>
            );
        }
        return null;
    };

    const presetButtons: { key: RangePreset; label: string }[] = [
        { key: '7d', label: '7 Days' },
        { key: '30d', label: '30 Days' },
        { key: 'month', label: 'This Month' },
        { key: 'year', label: 'This Year' },
        { key: 'custom', label: 'Custom' },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Stats Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue">
                        <span className="material-symbols-outlined">receipt_long</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">Total Orders</div>
                        <div className="admin-stat-value">{data.orders.totalOrders}</div>
                        <div className="admin-stat-sub">{data.orders.pendingOrders} pending</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon yellow">
                        <span className="material-symbols-outlined">paid</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">Monthly Revenue</div>
                        <div className="admin-stat-value">{formatCurrency(data.orders.monthlyRevenue)}</div>
                        <div className="admin-stat-sub">Total: {formatCurrency(data.orders.totalRevenue)}</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">
                        <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">Products</div>
                        <div className="admin-stat-value">{data.products.totalProducts}</div>
                        <div className="admin-stat-sub">{data.products.activeProducts} active</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon red">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">Customers</div>
                        <div className="admin-stat-value">{data.customers.totalCustomers}</div>
                        <div className="admin-stat-sub">+{data.customers.newCustomersThisMonth} this month</div>
                    </div>
                </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="admin-card" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <h3 className="admin-chart-title">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'text-bottom', marginRight: '8px', color: '#2463eb' }}>trending_up</span>
                            Revenue Trend
                        </h3>
                        <p className="admin-chart-subtitle">
                            {chartStatus 
                                ? `Showing ${chartStatus.toLowerCase()} orders only` 
                                : 'All orders (excluding cancelled)'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select
                            className="admin-select"
                            value={chartStatus}
                            onChange={(e) => setChartStatus(e.target.value)}
                            style={{ fontSize: '12px', padding: '6px 10px' }}
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
                        {presetButtons.map(btn => (
                            <button
                                key={btn.key}
                                className={`admin-pagination-btn ${rangePreset === btn.key ? 'active' : ''}`}
                                onClick={() => setRangePreset(btn.key)}
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom date inputs */}
                {rangePreset === 'custom' && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>From:</label>
                        <input
                            type="date"
                            className="admin-form-input"
                            value={customFrom}
                            onChange={e => setCustomFrom(e.target.value)}
                            style={{ padding: '6px 10px', fontSize: '13px' }}
                        />
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>To:</label>
                        <input
                            type="date"
                            className="admin-form-input"
                            value={customTo}
                            onChange={e => setCustomTo(e.target.value)}
                            style={{ padding: '6px 10px', fontSize: '13px' }}
                        />
                    </div>
                )}

                {/* Summary stats */}
                <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Period Revenue</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#2463eb' }}>{formatCurrency(totalChartRevenue)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                            {chartStatus ? `${chartStatus.charAt(0) + chartStatus.slice(1).toLowerCase()} Orders` : 'Total Orders'}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b' }}>{totalChartOrders}</div>
                    </div>
                </div>

                {/* Chart */}
                {revenueLoading ? (
                    <div className="admin-loading" style={{ padding: '40px 0' }}>
                        <div className="admin-loading-spinner" />
                    </div>
                ) : revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2463eb" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#2463eb" stopOpacity={0.4} />
                                </linearGradient>
                                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatShortDate}
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="revenue"
                                orientation="left"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="orders"
                                orientation="right"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                            />
                            <Bar
                                yAxisId="revenue"
                                dataKey="revenue"
                                name="Revenue (₫)"
                                fill="url(#revenueGrad)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                yAxisId="orders"
                                dataKey="orderCount"
                                name="Orders"
                                fill="url(#orderGrad)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="admin-empty" style={{ padding: '40px 0' }}>
                        <span className="material-symbols-outlined">bar_chart</span>
                        <p>No revenue data for this period</p>
                    </div>
                )}
            </div>

            {/* Charts + Product Alerts */}
            <div className="admin-charts-row">
                {/* Order Status Distribution */}
                <div className="admin-card">
                    <h3 className="admin-chart-title">Order Status Distribution</h3>
                    <p className="admin-chart-subtitle">Current order breakdown</p>
                    {orderChartData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={orderChartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={50}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                        labelLine={false}
                                    >
                                        {orderChartData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {orderChartData.map((item) => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }} />
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.name} ({item.value})</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="admin-empty"><p>No orders yet</p></div>
                    )}
                </div>

                {/* Product Alerts */}
                <div className="admin-card">
                    <h3 className="admin-chart-title">Product Alerts</h3>
                    <p className="admin-chart-subtitle">Stock status overview</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>warning</span>
                                <span style={{ fontWeight: 600, color: '#92400e' }}>Low Stock</span>
                            </div>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#92400e' }}>{data.products.lowStockProducts}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>inventory</span>
                                <span style={{ fontWeight: 600, color: '#991b1b' }}>Out of Stock</span>
                            </div>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#991b1b' }}>{data.products.outOfStockProducts}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#22c55e' }}>check_circle</span>
                                <span style={{ fontWeight: 600, color: '#166534' }}>Active Products</span>
                            </div>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#166534' }}>{data.products.activeProducts}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 className="admin-chart-title">Recent Orders</h3>
                        <p className="admin-chart-subtitle">Latest orders from customers</p>
                    </div>
                    <button className="admin-btn primary" onClick={() => navigate('/admin/orders')}>
                        View All
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </button>
                </div>
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentOrders.map((order) => (
                                <tr
                                    key={order.orderId}
                                    className="clickable"
                                    onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                                >
                                    <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                                    <td>{order.customerName || '—'}</td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</td>
                                    <td>{order.paymentMethod || '—'}</td>
                                    <td>
                                        <span className={`status-badge ${(order.status || '').toLowerCase()}`}>
                                            {order.status || '—'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(order.createdAt)}</td>
                                </tr>
                            ))}
                            {data.recentOrders.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No recent orders</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
