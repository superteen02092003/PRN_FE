import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminProducts } from '@/services/adminService';
import { getProductReviews } from '@/services/productService';
import { deleteReview } from '@/services/adminService';
import type { AdminProductResponse } from '@/types/admin.types';
import type { ReviewDto } from '@/types/product.types';
import { toast } from 'react-toastify';

interface ReviewWithProduct extends ReviewDto {
    productId: number;
    productName: string;
}

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const fetchAllReviews = useCallback(async () => {
        try {
            setLoading(true);
            // 1. Get all products
            const productsResult = await getAdminProducts({ pageSize: 200 });
            const products: AdminProductResponse[] = productsResult.items;

            // 2. Fetch reviews for each product
            const allReviews: ReviewWithProduct[] = [];
            const reviewPromises = products.map(async (product) => {
                try {
                    const reviewsData = await getProductReviews(product.productId, { pageSize: 100 });
                    if (reviewsData.reviews && reviewsData.reviews.items) {
                        reviewsData.reviews.items.forEach((review: ReviewDto) => {
                            allReviews.push({
                                ...review,
                                productId: product.productId,
                                productName: product.name,
                            });
                        });
                    }
                } catch {
                    // Skip products with no reviews
                }
            });

            await Promise.all(reviewPromises);

            // Sort by newest
            allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setReviews(allReviews);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllReviews();
    }, [fetchAllReviews]);

    const filteredReviews = reviews.filter(r => {
        const matchSearch = !searchTerm ||
            r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRating = ratingFilter === null || r.rating === ratingFilter;
        return matchSearch && matchRating;
    });

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            await deleteReview(reviewId);
            toast.success('Review deleted successfully');
            setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete review');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                className="material-symbols-outlined"
                style={{ fontSize: '16px', color: i < rating ? '#f59e0b' : '#e5e7eb' }}
            >
                star
            </span>
        ));
    };

    // Stats
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0';

    return (
        <AdminLayout title="Reviews">
            {/* Stats */}
            <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue">
                        <span className="material-symbols-outlined">reviews</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">Total Reviews</div>
                        <div className="admin-stat-value">{reviews.length}</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon yellow">
                        <span className="material-symbols-outlined">star</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">Avg Rating</div>
                        <div className="admin-stat-value">{avgRating}</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">
                        <span className="material-symbols-outlined">thumb_up</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">5-Star Reviews</div>
                        <div className="admin-stat-value">{reviews.filter(r => r.rating === 5).length}</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon red">
                        <span className="material-symbols-outlined">thumb_down</span>
                    </div>
                    <div>
                        <div className="admin-stat-label">1-Star Reviews</div>
                        <div className="admin-stat-value">{reviews.filter(r => r.rating === 1).length}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search-input">
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search by user, product, or comment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="admin-select"
                    value={ratingFilter ?? ''}
                    onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
                >
                    <option value="">All Ratings</option>
                    {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                </select>
            </div>

            {/* Reviews Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading-spinner" />
                        <span className="admin-loading-text">Loading reviews...</span>
                    </div>
                ) : (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Product</th>
                                        <th>User</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReviews.map((review) => (
                                        <tr key={review.reviewId}>
                                            <td style={{ fontWeight: 600 }}>#{review.reviewId}</td>
                                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {review.productName}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        backgroundColor: '#f0fdf4', color: '#22c55e',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: '12px'
                                                    }}>
                                                        {review.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{review.userName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    {renderStars(review.rating)}
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#374151' }}>
                                                {review.comment}
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(review.createdAt)}</td>
                                            <td>
                                                <button
                                                    className="admin-btn ghost"
                                                    title="Delete review"
                                                    onClick={() => handleDelete(review.reviewId)}
                                                    style={{ color: '#dc2626' }}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredReviews.length === 0 && (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No reviews found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="admin-stat-sub" style={{ textAlign: 'right', marginTop: '12px' }}>
                            Showing: <strong>{filteredReviews.length}</strong> of {reviews.length} reviews
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminReviewsPage;
