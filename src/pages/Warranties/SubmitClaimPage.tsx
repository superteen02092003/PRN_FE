import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import { getWarrantyById, submitWarrantyClaim } from '@/services/warrantyService';
import type { WarrantyDto } from '@/types/warranty.types';
import { toast } from 'react-toastify';
import './SubmitClaimPage.css';

const SubmitClaimPage = () => {
    const { warrantyId } = useParams<{ warrantyId: string }>();
    const navigate = useNavigate();

    const [warranty, setWarranty] = useState<WarrantyDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [issueDescription, setIssueDescription] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        const loadWarranty = async () => {
            try {
                setLoading(true);
                const found = await getWarrantyById(Number(warrantyId));
                if (!found) {
                    setError('Warranty not found or does not belong to you.');
                    return;
                }
                if (found.status !== 'ACTIVE') {
                    setError('This warranty is not active. Only active warranties can have claims submitted.');
                    return;
                }
                setWarranty(found);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load warranty');
            } finally {
                setLoading(false);
            }
        };
        loadWarranty();
    }, [warrantyId]);

    const validate = (): boolean => {
        if (issueDescription.trim().length < 10) {
            setValidationError('Issue description must be at least 10 characters.');
            return false;
        }
        if (issueDescription.trim().length > 1000) {
            setValidationError('Issue description must not exceed 1000 characters.');
            return false;
        }
        setValidationError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            const result = await submitWarrantyClaim(Number(warrantyId), {
                issueDescription: issueDescription.trim(),
                contactPhone: contactPhone.trim() || undefined,
            });

            toast.success(`Warranty claim submitted successfully! Claim ID: ${result.claimId}`);
            navigate('/warranties');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to submit claim');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
        });
    };

    return (
        <>
            <Header />
            <main className="submit-claim-page">
                <div className="container">
                    <button className="back-link" onClick={() => navigate('/warranties')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to My Warranties
                    </button>

                    <h1>Submit Warranty Claim</h1>

                    {loading && (
                        <div className="claim-loading">
                            <div className="loading-spinner" />
                            <p>Loading warranty details...</p>
                        </div>
                    )}

                    {error && (
                        <div className="claim-error-box">
                            <span className="material-symbols-outlined">error</span>
                            <p>{error}</p>
                            <button onClick={() => navigate('/warranties')}>Back to Warranties</button>
                        </div>
                    )}

                    {!loading && !error && warranty && (
                        <div className="claim-form-container">
                            {/* Warranty Info Summary */}
                            <div className="claim-warranty-summary">
                                <h3>Warranty Details</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">Product</span>
                                        <span className="summary-value">{warranty.product.name}</span>
                                    </div>
                                    {warranty.serialNumber && (
                                        <div className="summary-item">
                                            <span className="summary-label">Serial Number</span>
                                            <span className="summary-value mono">{warranty.serialNumber}</span>
                                        </div>
                                    )}
                                    <div className="summary-item">
                                        <span className="summary-label">Policy</span>
                                        <span className="summary-value">{warranty.policyName}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Expires</span>
                                        <span className="summary-value">{formatDate(warranty.expiryDate)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Claim Form */}
                            <form className="claim-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="issueDescription">
                                        Issue Description <span className="required">*</span>
                                    </label>
                                    <textarea
                                        id="issueDescription"
                                        value={issueDescription}
                                        onChange={(e) => setIssueDescription(e.target.value)}
                                        placeholder="Describe the issue with your product in detail (min 10 characters, max 1000)..."
                                        rows={5}
                                        maxLength={1000}
                                        required
                                    />
                                    <div className="char-counter">
                                        <span className={issueDescription.length < 10 ? 'text-warn' : ''}>
                                            {issueDescription.length}/1000
                                        </span>
                                        {issueDescription.length < 10 && issueDescription.length > 0 && (
                                            <span className="text-warn">Min 10 characters</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contactPhone">Contact Phone (Optional)</label>
                                    <input
                                        id="contactPhone"
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="e.g. 0901234567"
                                    />
                                </div>

                                {validationError && (
                                    <div className="validation-error">{validationError}</div>
                                )}

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn-submit-claim"
                                        disabled={submitting || issueDescription.trim().length < 10}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Claim'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => navigate('/warranties')}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default SubmitClaimPage;
