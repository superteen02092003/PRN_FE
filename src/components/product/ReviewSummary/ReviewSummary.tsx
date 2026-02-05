import type { ReviewSummaryDto } from '@/types/product.types';
import './ReviewSummary.css';

interface ReviewSummaryProps {
    summary: ReviewSummaryDto;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ summary }) => {
    const { averageRating, totalReviews, ratingDistribution } = summary;

    // Ensure we have all 5 ratings (5 to 1)
    const fullDistribution = [5, 4, 3, 2, 1].map((rating) => {
        const found = ratingDistribution.find((d) => d.rating === rating);
        return found || { rating, count: 0, percentage: 0 };
    });

    return (
        <div className="review-summary">
            {/* Overall Rating */}
            <div className="overall-rating">
                <div className="rating-number">{averageRating.toFixed(1)}</div>
                <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <div className="total-reviews">{totalReviews} reviews</div>
            </div>

            {/* Rating Distribution */}
            <div className="rating-distribution">
                {fullDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="distribution-row">
                        <span className="rating-label">{rating} ★</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="rating-count">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewSummary;
