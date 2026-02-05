import type { ReviewDto, PaginationInfo } from '@/types/product.types';
import './ReviewList.css';

interface ReviewListProps {
    reviews: ReviewDto[];
    pagination: PaginationInfo | null;
    loading?: boolean;
    onPageChange?: (page: number) => void;
}

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    pagination,
    loading = false,
    onPageChange,
}) => {
    if (loading) {
        return (
            <div className="review-list-loading">
                <div className="loading-spinner" />
                <span>Loading reviews...</span>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="review-list-empty">
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {/* Reviews */}
            <div className="reviews-container">
                {reviews.map((review) => (
                    <div key={review.reviewId} className="review-item">
                        <div className="review-header">
                            <div className="reviewer-info">
                                <div className="reviewer-avatar">
                                    {review.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="reviewer-details">
                                    <span className="reviewer-name">{review.userName}</span>
                                    <span className="review-date">{formatDate(review.createdAt)}</span>
                                </div>
                            </div>
                            <div className="review-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`star ${star <= review.rating ? 'filled' : ''}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="review-content">
                            <p>{review.comment}</p>
                        </div>
                        {review.updatedAt && (
                            <div className="review-edited">
                                (edited on {formatDate(review.updatedAt)})
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="review-pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange?.(pagination.pageNumber - 1)}
                        disabled={pagination.pageNumber <= 1}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {pagination.pageNumber} of {pagination.totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange?.(pagination.pageNumber + 1)}
                        disabled={pagination.pageNumber >= pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
