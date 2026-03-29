import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAllReturnRequests, processReturnRequest } from '@/services/returnService';
import type { ReturnRequestDto, ReturnStatus } from '@/types/return.types';
import { toast } from 'react-toastify';

const statusColors: Record<ReturnStatus, { color: string; bg: string }> = {
    SUBMITTED: { color: '#b45309', bg: '#fef3c7' },
    APPROVED: { color: '#15803d', bg: '#dcfce7' },
    REJECTED: { color: '#991b1b', bg: '#fee2e2' },
    COMPLETED: { color: '#1d4ed8', bg: '#dbeafe' },
};

const statusLabels: Record<ReturnStatus, string> = {
    SUBMITTED: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
};

const typeLabels: Record<string, string> = {
    RETURN: 'Return & Refund',
    EXCHANGE: 'Exchange Product',
};

const formatDate = (date: string | undefined): string => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const AdminReturnRequestsPage = () => {
    const [requests, setRequests] = useState<ReturnRequestDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selected, setSelected] = useState<ReturnRequestDto | null>(null);
    const [newStatus, setNewStatus] = useState<'APPROVED' | 'REJECTED' | 'COMPLETED'>('APPROVED');
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllReturnRequests(page, 10);
            setRequests(data.items);
            setTotalPages(data.totalPages);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const openDialog = (req: ReturnRequestDto) => {
        setSelected(req);
        setAdminNote(req.adminNote || '');
        setNewStatus(req.status === 'SUBMITTED' ? 'APPROVED' : 'COMPLETED');
        setDialogOpen(true);
    };

    const handleProcess = async () => {
        if (!selected) return;
        setProcessing(true);
        try {
            await processReturnRequest(selected.returnRequestId, { status: newStatus, adminNote: adminNote || undefined });
            toast.success('Request processed successfully');
            setDialogOpen(false);
            loadRequests();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout title="Return Requests">
            <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                    Manage Return / Exchange Requests
                </h2>

                {loading ? (
                    <p style={{ color: '#6b7280' }}>Loading...</p>
                ) : requests.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>No requests found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Order</th>
                                    <th style={thStyle}>User</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Reason</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Created</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => {
                                    const sc = statusColors[req.status] || statusColors.SUBMITTED;
                                    return (
                                        <tr key={req.returnRequestId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={tdStyle}>#{req.returnRequestId}</td>
                                            <td style={tdStyle}>{req.orderNumber}</td>
                                            <td style={tdStyle}>{req.userName}</td>
                                            <td style={tdStyle}>{typeLabels[req.type] || req.type}</td>
                                            <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>{req.reason}</td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: sc.bg,
                                                    color: sc.color,
                                                }}>
                                                    {statusLabels[req.status]}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{formatDate(req.createdAt)}</td>
                                            <td style={tdStyle}>
                                                {req.status !== 'COMPLETED' && req.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => openDialog(req)}
                                                        style={{
                                                            padding: '0.35rem 0.75rem',
                                                            background: '#2563eb',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Process
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={pageBtnStyle}>
                            &lsaquo;
                        </button>
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>Page {page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} style={pageBtnStyle}>
                            &rsaquo;
                        </button>
                    </div>
                )}
            </div>

            {/* Process Dialog */}
            {dialogOpen && selected && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setDialogOpen(false)} />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '480px', maxWidth: '95vw',
                        zIndex: 1000, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Process Request #{selected.returnRequestId}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.25rem' }}>
                            Order {selected.orderNumber} — {typeLabels[selected.type]}
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>New Status</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {(selected.status === 'SUBMITTED'
                                    ? (['APPROVED', 'REJECTED'] as const)
                                    : (['COMPLETED'] as const)
                                ).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setNewStatus(s)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '6px',
                                            border: `2px solid ${newStatus === s ? '#2563eb' : '#e5e7eb'}`,
                                            background: newStatus === s ? '#eff6ff' : '#fff',
                                            color: newStatus === s ? '#1d4ed8' : '#374151',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {statusLabels[s]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                Notes (optional)
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                rows={3}
                                placeholder="Enter notes for the user..."
                                style={{
                                    width: '100%', border: '1px solid #d1d5db', borderRadius: '6px',
                                    padding: '0.5rem 0.75rem', fontSize: '0.875rem', resize: 'vertical',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button onClick={() => setDialogOpen(false)} disabled={processing} style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                                Cancel
                            </button>
                            <button onClick={handleProcess} disabled={processing} style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: 600,
    color: '#374151',
    whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    color: '#374151',
    verticalAlign: 'middle',
};

const pageBtnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

export default AdminReturnRequestsPage;
