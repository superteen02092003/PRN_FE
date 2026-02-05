import { useState } from 'react';
import type { CreateReviewDto } from '@/types/product.types';
import './ReviewForm.css';

interface ReviewFormProps {
    onSubmit: (review: CreateReviewDto) => Promise<boolean>;
    isAuthenticated: boolean;
    loading?: boolean;
    onLoginClick?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    onSubmit,
    isAuthenticated,
    loading = false,
    onLoginClick,
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            onLoginClick?.();
            return;
        }

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Review must be at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const success = await onSubmit({ rating, comment: comment.trim() });
            if (success) {
                setSuccess(true);
                setRating(0);
                setComment('');
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="review-form-login">
                <p>Please login to write a review</p>
                <button className="login-btn" onClick={onLoginClick}>
                    Login
                </button>
            </div>
        );
    }

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Write a Review</h3>

            {/* Rating Stars */}
            <div className="rating-input">
                <span className="rating-label">Your Rating:</span>
                <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star-btn ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={loading || isSubmitting}
                        >
                            ★
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <span className="rating-text">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                    </span>
                )}
            </div>

            {/* Comment */}
            <div className="comment-input">
                <label htmlFor="review-comment" className="comment-label">
                    Your Review:
                </label>
                <textarea
                    id="review-comment"
                    className="comment-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    disabled={loading || isSubmitting}
                />
                <div className="char-count">
                    {comment.length} characters (minimum 10)
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="form-error">{error}</div>}

            {/* Success Message */}
            {success && (
                <div className="form-success">
                    Review submitted successfully!
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                className="submit-btn"
                disabled={loading || isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <span className="loading-spinner" />
                        Submitting...
                    </>
                ) : (
                    'Submit Review'
                )}
            </button>
        </form>
    );
};

export default ReviewForm;
