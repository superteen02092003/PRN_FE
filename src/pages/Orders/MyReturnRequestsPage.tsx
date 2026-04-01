import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { getMyReturnRequests } from '@/services/returnService';
import type { ReturnRequestDto, ReturnStatus } from '@/types/return.types';
import './OrderPages.css';

const statusConfig: Record<ReturnStatus, { label: string; color: string }> = {
    SUBMITTED: { label: 'Pending', color: '#f59e0b' },
    APPROVED: { label: 'Approved', color: '#3b82f6' },
    REJECTED: { label: 'Rejected', color: '#ef4444' },
    COMPLETED: { label: 'Completed', color: '#10b981' },
};

const typeLabels: Record<string, string> = {
    RETURN: 'Return & Refund',
    EXCHANGE: 'Exchange Product',
};

const formatDate = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const MyReturnRequestsPage = () => {
    const [requests, setRequests] = useState<ReturnRequestDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyReturnRequests(page, 10);
            setRequests(data.items);
            setTotalPages(data.totalPages);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    return (
        <>
            <Header />
            <div className="order-page-wrapper">
                <nav className="od-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <Link to="/orders">Orders</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <span className="od-breadcrumb-current">Return / Exchange Requests</span>
                </nav>

                <div className="orders-header">
                    <h1 className="orders-title">Return / Exchange Requests</h1>
                </div>

                {loading ? (
                    <div className="orders-loading">
                        <div className="order-loading-spinner" />
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <div className="order-empty-state">
                        <p style={{ color: '#ef4444' }}>{error}</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="order-empty-state">
                        <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#d1d5db' }}>undo</span>
                        <p>You have no return/exchange requests yet.</p>
                        <Link to="/orders" className="orders-shop-btn">View Orders</Link>
                    </div>
                ) : (
                    <>
                        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {requests.map((req) => {
                                const status = statusConfig[req.status] || statusConfig.SUBMITTED;
                                return (
                                    <div key={req.returnRequestId} className="od-card" style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                                    Order #{req.orderNumber}
                                                </p>
                                                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                                    {formatDate(req.createdAt)}
                                                </p>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.2rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: `${status.color}20`,
                                                    color: status.color,
                                                }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Request Type</p>
                                                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{typeLabels[req.type] || req.type}</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                                            <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                                                <strong>Reason:</strong> {req.reason}
                                            </p>
                                            {req.adminNote && (
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                                    <strong>Admin note:</strong> {req.adminNote}
                                                </p>
                                            )}
                                            {req.items?.length > 0 && (
                                                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {req.items.map(item => (
                                                        <div key={item.orderItemId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            {item.productImageUrl && (
                                                                <img src={item.productImageUrl} alt={item.productName || ''} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                                                            )}
                                                            <div>
                                                                <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.productName}</p>
                                                                {item.serialNumbers?.length > 0 && (
                                                                    <p style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                                                        S/N: {item.serialNumbers.join(', ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="orders-pagination">
                                <button
                                    className="orders-page-btn"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <span className="orders-page-info">Page {page} / {totalPages}</span>
                                <button
                                    className="orders-page-btn"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyReturnRequestsPage;
