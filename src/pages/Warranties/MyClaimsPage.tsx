import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import { getMyClaims } from '@/services/warrantyService';
import type { CustomerWarrantyClaimDto, ClaimStatus } from '@/types/warranty.types';
import { toast } from 'react-toastify';
import './MyClaimsPage.css';

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

const MyClaimsPage = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState<CustomerWarrantyClaimDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadClaims = useCallback(async () => {
        try {
            setLoading(true);
            console.log('[MyClaimsPage] Fetching claims, page:', page, 'filter:', statusFilter);
            const result = await getMyClaims(page, 10);
            console.log('[MyClaimsPage] Claims received:', result);
            
            // Filter locally if user selected a status dropdown
            let filteredItems = result.items;
            if (statusFilter) {
                filteredItems = filteredItems.filter(c => c.status === statusFilter);
            }
            
            setClaims(filteredItems);
            setTotalPages(result.totalPages);
        } catch (err) {
            console.error('[MyClaimsPage] Error loading claims:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load claims';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        loadClaims();
    }, [loadClaims]);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === '0001-01-01T00:00:00') return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <>
            <Header />
            <main className="my-claims-page">
                <div className="container">
                    <div className="claims-header">
                        <button className="back-link" onClick={() => navigate('/warranties')}>
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to My Warranties
                        </button>
                        <h1>My Warranty Claims</h1>
                        <p className="claims-subtitle">
                            Track the status of your submitted warranty requests.
                        </p>
                    </div>

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
                        <div className="claims-loading">
                            <div className="loading-spinner" />
                            <p>Loading your claims...</p>
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="claims-empty">
                            <span className="material-symbols-outlined">assignment</span>
                            <h3>No Claims Found</h3>
                            <p>You have not submitted any warranty claims{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
                            <button className="btn-primary mt-4" onClick={() => navigate('/warranties')}>
                                Submit New Claim
                            </button>
                        </div>
                    ) : (
                        <div className="customer-claims-list">
                            {claims.map(claim => {
                                const sc = statusColors[claim.status] || statusColors.SUBMITTED;
                                return (
                                    <div key={claim.claimId} className="customer-claim-card">
                                        <div className="customer-claim-card-top">
                                            <div className="claim-id-section">
                                                {claim.productImageUrl ? (
                                                    <img src={claim.productImageUrl} alt={claim.productName} className="claim-product-image" />
                                                ) : (
                                                    <span className="material-symbols-outlined claim-icon">build_circle</span>
                                                )}
                                                <div>
                                                    <span className="claim-id-label">Claim #{claim.claimId}</span>
                                                    <h3 className="claim-product">{claim.productName}</h3>
                                                    <span className="claim-serial-number">
                                                        S/N: {claim.serialNumber}
                                                        <button
                                                            className="claim-serial-copy"
                                                            title="Copy serial number"
                                                            onClick={() => navigator.clipboard.writeText(claim.serialNumber)}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>content_copy</span>
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className="claim-status-badge"
                                                style={{ color: sc.color, backgroundColor: sc.bg }}
                                            >
                                                {claim.status}
                                            </span>
                                        </div>

                                        <div className="customer-claim-card-body">
                                            <div className="claim-info-grid">
                                                <div className="claim-info-item">
                                                    <span className="claim-info-label">Submitted On</span>
                                                    <span className="claim-info-value">{formatDate(claim.submittedAt)}</span>
                                                </div>
                                                <div className="claim-info-item">
                                                    <span className="claim-info-label">Warranty Policy</span>
                                                    <span className="claim-info-value">{claim.policyName}</span>
                                                </div>
                                                <div className="claim-info-item">
                                                    <span className="claim-info-label">Warranty Expires</span>
                                                    <span className="claim-info-value">{formatDate(claim.warrantyExpiryDate)}</span>
                                                </div>
                                            </div>

                                            <div className="claim-detail-section">
                                                <span className="claim-section-title">Issue Description</span>
                                                <p className="claim-text-content">{claim.issueDescription}</p>
                                            </div>

                                            {claim.resolutionNote && (
                                                <div className="claim-detail-section resolution-section">
                                                    <div className="resolution-header">
                                                        <span className="material-symbols-outlined">gavel</span>
                                                        <span className="claim-section-title">Response from Support</span>
                                                    </div>
                                                    <p className="claim-text-content">{claim.resolutionNote}</p>
                                                    {claim.resolvedDate && (
                                                        <span className="resolution-date">
                                                            Processed on {formatDate(claim.resolvedDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
                </div>
            </main>
            <Footer />
        </>
    );
};

export default MyClaimsPage;
