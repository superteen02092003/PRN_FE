import type { CartItemDto } from '@/types/cart.types';
import CartItem from '../CartItem';
import './CartItemList.css';

interface CartItemListProps {
    items: CartItemDto[];
    onUpdateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
    onRemove: (cartItemId: number) => Promise<boolean>;
    loading?: boolean;
}

const CartItemList: React.FC<CartItemListProps> = ({
    items,
    onUpdateQuantity,
    onRemove,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="cart-item-list cart-item-list--loading">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="cart-item-skeleton">
                        <div className="skeleton skeleton-image" />
                        <div className="skeleton-content">
                            <div className="skeleton skeleton-title" />
                            <div className="skeleton skeleton-text" />
                            <div className="skeleton skeleton-price" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="cart-item-list">
            <div className="cart-item-list__header">
                <span className="header-product">Product</span>
                <span className="header-quantity">Quantity</span>
                <span className="header-total">Total</span>
                <span className="header-action"></span>
            </div>
            <div className="cart-item-list__items">
                {items.map((item) => (
                    <CartItem
                        key={item.cartItemId}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
};

export default CartItemList;
