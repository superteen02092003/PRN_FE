import { useState } from 'react';
import QuantitySelector from '../QuantitySelector';
import './AddToCartButton.css';

interface AddToCartButtonProps {
    inStock: boolean;
    stockQuantity: number;
    isAuthenticated: boolean;
    onAddToCart: (quantity: number) => Promise<boolean>;
    onLoginClick?: () => void;
    loading?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    inStock,
    stockQuantity,
    isAuthenticated,
    onAddToCart,
    onLoginClick,
    loading = false,
}) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            onLoginClick?.();
            return;
        }

        if (!inStock || stockQuantity <= 0) {
            setMessage({ type: 'error', text: 'Product is out of stock' });
            return;
        }

        // Validate quantity before adding
        if (quantity > stockQuantity) {
            setMessage({ 
                type: 'error', 
                text: `Cannot add ${quantity} items. Only ${stockQuantity} available in stock.` 
            });
            return;
        }

        setIsAdding(true);
        setMessage(null);

        try {
            const success = await onAddToCart(quantity);
            if (success) {
                setMessage({ type: 'success', text: 'Added to cart successfully!' });
                setQuantity(1);
                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            // Extract detailed error message
            let errorMessage = 'Failed to add to cart';
            
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            // Check if error message contains stock information
            if (errorMessage.toLowerCase().includes('stock') || errorMessage.toLowerCase().includes('quantity')) {
                // Error already has stock info, use as is
                setMessage({ type: 'error', text: errorMessage });
            } else {
                // Generic error
                setMessage({ type: 'error', text: errorMessage });
            }
        } finally {
            setIsAdding(false);
        }
    };

    const isDisabled = loading || isAdding || !inStock || stockQuantity <= 0;

    return (
        <div className="add-to-cart-section">
            {/* Quantity Selector */}
            <div className="quantity-row">
                <span className="quantity-label">Quantity:</span>
                <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={stockQuantity}
                    disabled={!inStock || !isAuthenticated}
                />
            </div>

            {/* Add to Cart Button */}
            <button
                className={`add-to-cart-btn ${!isAuthenticated ? 'login-required' : ''}`}
                onClick={handleAddToCart}
                disabled={isDisabled}
            >
                {isAdding ? (
                    <span className="loading-spinner" />
                ) : !isAuthenticated ? (
                    'Login to Purchase'
                ) : !inStock ? (
                    'Out of Stock'
                ) : (
                    'Add to Cart'
                )}
            </button>

            {/* Message */}
            {message && (
                <div className={`cart-message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default AddToCartButton;
