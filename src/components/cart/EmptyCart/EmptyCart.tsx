import { Link } from 'react-router-dom';
import './EmptyCart.css';

interface EmptyCartProps {
    title?: string;
    message?: string;
}

const EmptyCart: React.FC<EmptyCartProps> = ({
    title = 'Your cart is empty',
    message = 'Looks like you haven\'t added any items to your cart yet.',
}) => {
    return (
        <div className="empty-cart">
            <div className="empty-cart__icon">
                <span className="material-symbols-outlined">shopping_cart</span>
            </div>
            <h2 className="empty-cart__title">{title}</h2>
            <p className="empty-cart__message">{message}</p>
            <Link to="/products" className="empty-cart__cta">
                <span className="material-symbols-outlined">arrow_back</span>
                Continue Shopping
            </Link>
        </div>
    );
};

export default EmptyCart;
