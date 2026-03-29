import { useState } from 'react';
import { createProductReview } from '@/services/productService';
import './ReviewProductModal.css';

interface ReviewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: number;
    productName: string;
    productImage?: string;
    onSuccess?: () => void;
}

const ReviewProductModal = ({
    isOpen,
    onClose,
    productId,
    productName,
    productImage,
    onSuccess,
}: ReviewProductModalProps) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!comment.trim()) {
            setError('Please write a comment');
            return;
        }

        // Frontend validation for minimum length
        if (comment.trim().length < 10) {
            setError('Review must be at least 10 characters long');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            
            await createProductReview(productId, {
                rating,
                comment: comment.trim(),
            });

            // Success
            if (onSuccess) onSuccess();
            onClose();
            
            // Reset form
            setRating(5);
            setComment('');
        } catch (err) {
            // Log full error for debugging
            console.error('Review submission error:', err);
            
            // Extract error message from different error types
            let errorMessage = 'Failed to submit review';
            
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            // Provide user-friendly message for common errors
            if (errorMessage.includes('status code 400') || errorMessage.includes('400')) {
                // Check if backend provided specific message
                if (errorMessage.toLowerCase().includes('character') || errorMessage.toLowerCase().includes('length')) {
                    // Keep backend's specific validation message
                    errorMessage = errorMessage;
                } else {
                    errorMessage = 'Unable to submit review. You may have already reviewed this product or haven\'t purchased it yet.';
                }
            } else if (errorMessage.includes('status code 403') || errorMessage.includes('403')) {
                errorMessage = 'You don\'t have permission to review this product. Please make sure you\'ve purchased and received it.';
            } else if (errorMessage.includes('status code 401') || errorMessage.includes('401')) {
                errorMessage = 'Please login to submit a review.';
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setRating(5);
            setComment('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay" onClick={handleClose}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="review-modal-header">
                    <h3>Write a Review</h3>
                    <button
                        className="review-modal-close"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="review-modal-product">
                    {productImage && (
                        <img src={productImage} alt={productName} />
                    )}
                    <div>
                        <p className="review-modal-product-name">{productName}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="review-modal-form">
                    {/* Rating */}
                    <div className="review-modal-field">
                        <label>Your Rating</label>
                        <div className="review-modal-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`review-star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    disabled={isSubmitting}
                                >
                                    <span className="material-symbols-outlined">
                                        {star <= (hoveredRating || rating) ? 'star' : 'star_border'}
                                    </span>
                                </button>
                            ))}
                            <span className="review-rating-text">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="review-modal-field">
                        <label>
                            Your Review
                            <span className="review-char-count">
                                {comment.trim().length}/10 characters minimum
                            </span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            rows={5}
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    {error && (
                        <div className="review-modal-error">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    <div className="review-modal-actions">
                        <button
                            type="button"
                            className="review-modal-btn cancel"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="review-modal-btn submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="review-modal-spinner" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewProductModal;
