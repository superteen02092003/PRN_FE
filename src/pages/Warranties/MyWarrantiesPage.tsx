import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import { getMyWarranties } from '@/services/warrantyService';
import type { WarrantyDto, WarrantyStatus } from '@/types/warranty.types';
import './MyWarrantiesPage.css';

const statusConfig: Record<WarrantyStatus, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: 'Active', color: '#15803d', bg: '#dcfce7' },
    IN_REPAIR: { label: 'In Repair', color: '#b45309', bg: '#fef3c7' },
    REPAIRED: { label: 'Repaired', color: '#1d4ed8', bg: '#dbeafe' },
    EXPIRED: { label: 'Expired', color: '#991b1b', bg: '#fee2e2' },
    VOID: { label: 'Void', color: '#6b7280', bg: '#f3f4f6' },
};

const MyWarrantiesPage = () => {
    const navigate = useNavigate();
    const [warranties, setWarranties] = useState<WarrantyDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWarranties = async () => {
            try {
                setLoading(true);
                const data = await getMyWarranties();
                setWarranties(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load warranties');
            } finally {
                setLoading(false);
            }
        };
        loadWarranties();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
        });
    };

    return (
        <>
            <Header />
            <main className="warranties-page">
                <div className="container">
                    <div className="warranties-header">
                        <h1>My Warranties</h1>
                        <p className="warranties-subtitle">
                            View your product warranties and submit claims for products that need repair.
                        </p>
                    </div>

                    {loading && (
                        <div className="warranties-loading">
                            <div className="loading-spinner" />
                            <p>Loading your warranties...</p>
                        </div>
                    )}

                    {error && (
                        <div className="warranties-error">
                            <span className="material-symbols-outlined">error</span>
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    )}

                    {!loading && !error && warranties.length === 0 && (
                        <div className="warranties-empty">
                            <span className="material-symbols-outlined">shield</span>
                            <h3>No Warranties Found</h3>
                            <p>Your product warranties will appear here after your orders are delivered.</p>
                            <button className="btn-primary" onClick={() => navigate('/products')}>
                                Browse Products
                            </button>
                        </div>
                    )}

                    {!loading && !error && warranties.length > 0 && (
                        <div className="warranties-grid">
                            {warranties.map((warranty) => {
                                const statusCfg = statusConfig[warranty.status] || statusConfig.VOID;
                                const isClaimable = warranty.status === 'ACTIVE';

                                return (
                                    <div key={warranty.warrantyId} className="warranty-card">
                                        <div className="warranty-card-header">
                                            <div className="warranty-product-info">
                                                {warranty.product.image ? (
                                                    <img
                                                        src={warranty.product.image}
                                                        alt={warranty.product.name}
                                                        className="warranty-product-img"
                                                    />
                                                ) : (
                                                    <div className="warranty-product-img-placeholder">
                                                        <span className="material-symbols-outlined">devices</span>
                                                    </div>
                                                )}
                                                <div className="warranty-product-details">
                                                    <h3
                                                        className="warranty-product-name"
                                                        onClick={() => navigate(`/products/${warranty.product.productId}`)}
                                                    >
                                                        {warranty.product.name}
                                                    </h3>
                                                    <span className="warranty-policy-name">
                                                        🛡️ {warranty.policyName}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className="warranty-status-badge"
                                                style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
                                            >
                                                {statusCfg.label}
                                            </span>
                                        </div>

                                        <div className="warranty-card-body">
                                            {warranty.serialNumber && (
                                                <div className="warranty-info-row">
                                                    <span className="warranty-info-label">Serial Number</span>
                                                    <span className="warranty-info-value mono">{warranty.serialNumber}</span>
                                                </div>
                                            )}
                                            <div className="warranty-info-row">
                                                <span className="warranty-info-label">Purchase Date</span>
                                                <span className="warranty-info-value">{formatDate(warranty.purchaseDate)}</span>
                                            </div>
                                            <div className="warranty-info-row">
                                                <span className="warranty-info-label">Expiry Date</span>
                                                <span className="warranty-info-value">{formatDate(warranty.expiryDate)}</span>
                                            </div>
                                            <div className="warranty-info-row">
                                                <span className="warranty-info-label">Time Remaining</span>
                                                <span className={`warranty-info-value ${warranty.monthsRemaining <= 1 ? 'text-danger' : ''}`}>
                                                    {warranty.monthsRemaining > 0
                                                        ? `${warranty.monthsRemaining} month(s)`
                                                        : 'Expired'}
                                                </span>
                                            </div>
                                        </div>

                                        {isClaimable && (
                                            <div className="warranty-card-actions">
                                                <button
                                                    className="btn-claim"
                                                    onClick={() => navigate(`/warranties/${warranty.warrantyId}/claim`)}
                                                >
                                                    <span className="material-symbols-outlined">build</span>
                                                    Submit Warranty Claim
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default MyWarrantiesPage;
