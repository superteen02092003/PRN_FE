import { useState } from 'react';
import type { CartItemDto } from '@/types/cart.types';
import './CartItem.css';

interface CartItemProps {
    item: CartItemDto;
    onUpdateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
    onRemove: (cartItemId: number) => Promise<boolean>;
    disabled?: boolean;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const CartItem: React.FC<CartItemProps> = ({
    item,
    onUpdateQuantity,
    onRemove,
    disabled = false,
}) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleQuantityChange = async (newQuantity: number) => {
        if (newQuantity < 1 || newQuantity > item.stockQuantity) return;

        setIsUpdating(true);
        await onUpdateQuantity(item.cartItemId, newQuantity);
        setIsUpdating(false);
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        await onRemove(item.cartItemId);
        setIsRemoving(false);
    };

    const isDisabled = disabled || isUpdating || isRemoving;

    return (
        <div className={`cart-item ${isRemoving ? 'removing' : ''}`}>
            {/* Product Image */}
            <div className="cart-item__image">
                {item.primaryImage ? (
                    <img src={item.primaryImage} alt={item.name} />
                ) : (
                    <div className="cart-item__no-image">
                        <span className="material-symbols-outlined">image</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="cart-item__info">
                <h3 className="cart-item__name">{item.name}</h3>
                <p className="cart-item__sku">SKU: {item.sku}</p>
                <p className="cart-item__price">{formatPrice(item.price)}</p>

                {/* Stock Status */}
                {!item.inStock && (
                    <span className="cart-item__out-of-stock">Out of Stock</span>
                )}
                {item.inStock && item.stockQuantity < 5 && (
                    <span className="cart-item__low-stock">
                        Only {item.stockQuantity} left
                    </span>
                )}
            </div>

            {/* Quantity Controls */}
            <div className="cart-item__quantity">
                <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={isDisabled || item.quantity <= 1}
                >
                    <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={isDisabled || item.quantity >= item.stockQuantity}
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            {/* Item Total */}
            <div className="cart-item__total">
                <span className="total-label">Total</span>
                <span className="total-value">{formatPrice(item.itemTotal)}</span>
            </div>

            {/* Remove Button */}
            <button
                className="cart-item__remove"
                onClick={handleRemove}
                disabled={isDisabled}
                title="Remove item"
            >
                {isRemoving ? (
                    <div className="loading-spinner-small" />
                ) : (
                    <span className="material-symbols-outlined">delete</span>
                )}
            </button>

            {/* Loading Overlay */}
            {isUpdating && (
                <div className="cart-item__loading">
                    <div className="loading-spinner-small" />
                </div>
            )}
        </div>
    );
};

export default CartItem;
