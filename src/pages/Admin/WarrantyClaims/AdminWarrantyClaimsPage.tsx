import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAllWarrantyClaims, resolveWarrantyClaim } from '@/services/warrantyService';
import type { WarrantyClaimDto, ClaimStatus } from '@/types/warranty.types';
import { toast } from 'react-toastify';
import './AdminWarrantyClaimsPage.css';

const statusFilters: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Unresolved', value: 'UNRESOLVED' },
];

const statusColors: Record<ClaimStatus, { color: string; bg: string }> = {
    SUBMITTED: { color: '#b45309', bg: '#fef3c7' },
    APPROVED: { color: '#15803d', bg: '#dcfce7' },
    REJECTED: { color: '#991b1b', bg: '#fee2e2' },
    RESOLVED: { color: '#1d4ed8', bg: '#dbeafe' },
    UNRESOLVED: { color: '#dc2626', bg: '#fecaca' },
};

const AdminWarrantyClaimsPage = () => {
    const [claims, setClaims] = useState<WarrantyClaimDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Resolve dialog state
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<WarrantyClaimDto | null>(null);
    const [resolution, setResolution] = useState<'APPROVED' | 'REJECTED' | 'RESOLVED' | 'UNRESOLVED'>('APPROVED');
    const [resolutionNote, setResolutionNote] = useState('');
    const [resolving, setResolving] = useState(false);

    const loadClaims = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAllWarrantyClaims(statusFilter || undefined, page, 10);
            setClaims(result.items);
            setTotalPages(result.totalPages);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load claims');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => {
        loadClaims();
    }, [loadClaims]);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const openResolveDialog = (claim: WarrantyClaimDto) => {
        setSelectedClaim(claim);
        setResolution(claim.status === 'APPROVED' ? 'RESOLVED' : 'APPROVED');
        setResolutionNote('');
        setResolveDialogOpen(true);
    };

    const handleResolve = async () => {
        if (!selectedClaim) return;
        try {
            setResolving(true);
            await resolveWarrantyClaim(selectedClaim.claimId, {
                resolution,
                resolutionNote: resolutionNote.trim() || undefined,
            });
            toast.success(`Claim #${selectedClaim.claimId} ${resolution.toLowerCase()} successfully`);
            setResolveDialogOpen(false);
            loadClaims();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to resolve claim');
        } finally {
            setResolving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <AdminLayout title="Warranty Claims">
            {/* Status Filter Chips */}
            <div className="claims-filter-bar">
                {statusFilters.map(f => (
                    <button
                        key={f.value}
                        className={`filter-chip ${statusFilter === f.value ? 'active' : ''}`}
                        onClick={() => handleFilterChange(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Claims List */}
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                    <span className="admin-loading-text">Loading claims...</span>
                </div>
            ) : claims.length === 0 ? (
                <div className="claims-empty">
                    <span className="material-symbols-outlined">assignment</span>
                    <p>No warranty claims found{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
                </div>
            ) : (
                <div className="claims-list">
                    {claims.map(claim => {
                        const sc = statusColors[claim.status] || statusColors.SUBMITTED;
                        return (
                            <div key={claim.claimId} className="claim-card">
                                <div className="claim-card-top">
                                    <div className="claim-id">
                                        <span className="claim-id-label">Claim</span>
                                        <span className="claim-id-value">#{claim.claimId}</span>
                                    </div>
                                    <span
                                        className="claim-status-badge"
                                        style={{ color: sc.color, backgroundColor: sc.bg }}
                                    >
                                        {claim.status}
                                    </span>
                                </div>

                                <div className="claim-card-body">
                                    <div className="claim-info-grid">
                                        <div className="claim-info-item">
                                            <span className="claim-info-label">Customer</span>
                                            <span className="claim-info-value">{claim.customer.fullName}</span>
                                        </div>
                                        <div className="claim-info-item">
                                            <span className="claim-info-label">Product</span>
                                            <span className="claim-info-value">{claim.product.name}</span>
                                        </div>
                                        {claim.contactPhone && (
                                            <div className="claim-info-item">
                                                <span className="claim-info-label">Phone</span>
                                                <span className="claim-info-value">{claim.contactPhone}</span>
                                            </div>
                                        )}
                                        <div className="claim-info-item">
                                            <span className="claim-info-label">Submitted</span>
                                            <span className="claim-info-value">{formatDate(claim.submittedAt)}</span>
                                        </div>
                                    </div>

                                    <div className="claim-description">
                                        <span className="claim-info-label">Issue Description</span>
                                        <p>{claim.issueDescription}</p>
                                    </div>

                                    {claim.resolutionNote && (
                                        <div className="claim-resolution-note">
                                            <span className="claim-info-label">Resolution Note</span>
                                            <p>{claim.resolutionNote}</p>
                                        </div>
                                    )}
                                </div>

                                {(claim.status === 'SUBMITTED' || claim.status === 'APPROVED') && (
                                    <div className="claim-card-actions">
                                        <button
                                            className="admin-btn primary"
                                            onClick={() => openResolveDialog(claim)}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                                {claim.status === 'APPROVED' ? 'task_alt' : 'gavel'}
                                            </span>
                                            {claim.status === 'APPROVED' ? 'Finalize Resolution' : 'Resolve'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="claims-pagination">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            )}

            {/* Resolve Dialog Overlay */}
            {resolveDialogOpen && selectedClaim && (
                <div className="resolve-overlay" onClick={() => setResolveDialogOpen(false)}>
                    <div className="resolve-dialog" onClick={e => e.stopPropagation()}>
                        <h3>Resolve Claim #{selectedClaim.claimId}</h3>
                        <p className="resolve-context">
                            <strong>{selectedClaim.product.name}</strong> — {selectedClaim.customer.fullName}
                        </p>
                        <p className="resolve-issue">{selectedClaim.issueDescription}</p>

                        <div className="resolve-options">
                            {selectedClaim.status === 'SUBMITTED' && (
                                <label className="resolve-option">
                                    <input
                                        type="radio"
                                        name="resolution"
                                        value="APPROVED"
                                        checked={resolution === 'APPROVED'}
                                        onChange={() => setResolution('APPROVED')}
                                    />
                                    <span className="option-label approved">Approved</span>
                                    <span className="option-desc">Accept claim, mark warranty as IN_REPAIR</span>
                                </label>
                            )}
                            
                            {selectedClaim.status === 'SUBMITTED' && (
                                <label className="resolve-option">
                                    <input
                                        type="radio"
                                        name="resolution"
                                        value="REJECTED"
                                        checked={resolution === 'REJECTED'}
                                        onChange={() => setResolution('REJECTED')}
                                    />
                                    <span className="option-label rejected">Rejected</span>
                                    <span className="option-desc">Deny this warranty claim</span>
                                </label>
                            )}

                            {selectedClaim.status === 'APPROVED' && (
                                <>
                                    <label className="resolve-option">
                                        <input
                                            type="radio"
                                            name="resolution"
                                            value="RESOLVED"
                                            checked={resolution === 'RESOLVED'}
                                            onChange={() => setResolution('RESOLVED')}
                                        />
                                        <span className="option-label resolved">Resolved</span>
                                        <span className="option-desc">Issue fixed, mark warranty as REPAIRED</span>
                                    </label>
                                    <label className="resolve-option">
                                        <input
                                            type="radio"
                                            name="resolution"
                                            value="UNRESOLVED"
                                            checked={resolution === 'UNRESOLVED'}
                                            onChange={() => setResolution('UNRESOLVED')}
                                        />
                                        <span className="option-label rejected" style={{color: '#dc2626'}}>Cannot Fix</span>
                                        <span className="option-desc">Issue cannot be fixed, return device as is</span>
                                    </label>
                                </>
                            )}
                        </div>

                        <div className="resolve-note-group">
                            <label>Resolution Note (optional)</label>
                            <textarea
                                value={resolutionNote}
                                onChange={e => setResolutionNote(e.target.value)}
                                placeholder="e.g. Device replaced, send replacement to customer..."
                                rows={3}
                            />
                        </div>

                        <div className="resolve-actions">
                            <button
                                className="admin-btn primary"
                                onClick={handleResolve}
                                disabled={resolving}
                            >
                                {resolving ? 'Processing...' : `Confirm ${resolution}`}
                            </button>
                            <button
                                className="admin-btn ghost"
                                onClick={() => setResolveDialogOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminWarrantyClaimsPage;
