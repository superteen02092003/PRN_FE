import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import {
    CartItemList,
    CartSummary,
    CouponInput,
    EmptyCart,
} from '@/components/cart';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import './CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const {
        cart,
        loading,
        error,
        refetch,
        updateQuantity,
        removeItem,
        clearCart,
        validateCoupon,
    } = useCart();

    const [clearing, setClearing] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Handle quantity update
    const handleUpdateQuantity = async (cartItemId: number, quantity: number, stockQuantity?: number): Promise<boolean> => {
        // Validate quantity against stock
        if (stockQuantity !== undefined && quantity > stockQuantity) {
            toast.error(`Cannot update quantity. Only ${stockQuantity} items available in stock.`);
            return false;
        }

        const success = await updateQuantity(cartItemId, quantity);
        if (success) {
            toast.success('Cart updated');
        } else {
            // Show error from backend if update fails
            toast.error(error || 'Failed to update cart. Please check stock availability.');
        }
        return success;
    };

    // Handle remove item
    const handleRemoveItem = async (cartItemId: number): Promise<boolean> => {
        const success = await removeItem(cartItemId);
        if (success) {
            toast.success('Item removed from cart');
        }
        return success;
    };

    // Handle clear cart
    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) {
            return;
        }

        setClearing(true);
        const success = await clearCart();
        if (success) {
            toast.success('Cart cleared');
        }
        setClearing(false);
    };

    // Handle coupon
    const handleApplyCoupon = async (code: string) => {
        const result = await validateCoupon(code);
        if (result?.isValid) {
            toast.success('Coupon applied successfully!');
        } else {
            // Hiển thị rõ lý do coupon không hợp lệ thay vì crash page
            toast.error(result?.message || 'Invalid coupon code');
        }
        return result;
    };

    const handleRemoveCoupon = () => {
        // Reset cart state: xóa coupon + reset discount về 0
        refetch();
        toast.info('Coupon removed');
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <>
                <Header />
                <main className="cart-page">
                    <div className="container">
                        <div className="cart-header">
                            <div className="skeleton-box" style={{ width: '180px', height: '1.8rem', marginBottom: '0.5rem' }} />
                            <div className="skeleton-box" style={{ width: '140px', height: '0.9rem' }} />
                        </div>
                        <div className="cart-layout">
                            <div className="cart-items-section">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
                                        <div className="skeleton-box" style={{ width: '100px', height: '100px', borderRadius: '8px', flexShrink: 0 }} />
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div className="skeleton-box" style={{ width: '60%', height: '1rem' }} />
                                            <div className="skeleton-box" style={{ width: '40%', height: '0.8rem' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                <div className="skeleton-box" style={{ width: '90px', height: '1.2rem' }} />
                                                <div className="skeleton-box" style={{ width: '100px', height: '2rem', borderRadius: '8px' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-summary-section">
                                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                                    <div className="skeleton-box" style={{ width: '120px', height: '1rem', marginBottom: '1rem' }} />
                                    <div className="skeleton-box" style={{ width: '100%', height: '0.8rem', marginBottom: '0.75rem' }} />
                                    <div className="skeleton-box" style={{ width: '100%', height: '0.8rem', marginBottom: '0.75rem' }} />
                                    <div className="skeleton-box" style={{ width: '100%', height: '1.2rem', marginBottom: '1rem' }} />
                                    <div className="skeleton-box" style={{ width: '100%', height: '2.5rem', borderRadius: '10px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <Header />
                <main className="cart-page">
                    <div className="container">
                        <div className="cart-error">
                            <span className="material-symbols-outlined">error</span>
                            <h2>Something went wrong</h2>
                            <p>{error}</p>
                            <button onClick={refetch} className="retry-btn">
                                Try Again
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Empty cart
    if (!cart || cart.items.length === 0) {
        return (
            <>
                <Header />
                <main className="cart-page">
                    <div className="container">
                        <EmptyCart />
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="cart-page">
                <div className="container">
                    {/* Page Header */}
                    <div className="cart-header">
                        <h1 className="cart-title">Shopping Cart</h1>
                        <p className="cart-subtitle">
                            You have {cart.summary.totalItems} item{cart.summary.totalItems !== 1 ? 's' : ''} in your cart
                        </p>
                    </div>

                    {/* Cart Layout */}
                    <div className="cart-layout">
                        {/* Left: Cart Items */}
                        <div className="cart-items-section">
                            <div className="cart-items-header">
                                <h2>Cart Items</h2>
                                <button
                                    className="clear-cart-btn"
                                    onClick={handleClearCart}
                                    disabled={clearing}
                                >
                                    {clearing ? (
                                        <>
                                            <div className="loading-spinner-small" />
                                            Clearing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">delete_sweep</span>
                                            Clear All
                                        </>
                                    )}
                                </button>
                            </div>

                            <CartItemList
                                items={cart.items}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveItem}
                            />
                        </div>

                        {/* Right: Summary */}
                        <div className="cart-summary-section">
                            <CouponInput
                                appliedCoupon={cart.appliedCoupon}
                                onApplyCoupon={handleApplyCoupon}
                                onRemoveCoupon={handleRemoveCoupon}
                            />

                            <CartSummary
                                summary={cart.summary}
                                appliedCoupon={cart.appliedCoupon}
                                onCheckout={() =>
                                    navigate(
                                        cart.appliedCoupon
                                            ? `/checkout?coupon=${cart.appliedCoupon.couponCode}`
                                            : '/checkout'
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CartPage;
