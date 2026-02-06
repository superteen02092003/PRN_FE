import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
    userId: number;
    username: string;
    email: string;
    role: string;
}

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        // Check for logged in user
        const checkAuth = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkAuth();

        // Listen for storage changes (login/logout from other tabs)
        window.addEventListener('storage', checkAuth);

        // Custom event for same-tab updates
        window.addEventListener('authChange', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('authChange', checkAuth);
        };
    }, []);

    // Fetch cart count when user is logged in
    useEffect(() => {
        const fetchCartCount = async () => {
            if (!user) {
                setCartItemCount(0);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setCartItemCount(0);
                    return;
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || '/api'}/Cart`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setCartItemCount(data.data.summary?.totalItems || 0);
                    }
                }
            } catch {
                // Silently fail - cart count is not critical
            }
        };

        fetchCartCount();

        // Listen for cart updates
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdate', handleCartUpdate);

        return () => {
            window.removeEventListener('cartUpdate', handleCartUpdate);
        };
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCartItemCount(0);
        setShowDropdown(false);
        // Dispatch authChange event to notify AuthContext
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
    };

    const handleCartClick = () => {
        if (user) {
            navigate('/cart');
        } else {
            navigate('/login', { state: { from: '/cart' } });
        }
    };

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__content">
                    {/* Logo */}
                    <Link to="/" className="header__logo-wrapper">
                        <div className="header__logo-icon">
                            <span className="material-symbols-outlined">precision_manufacturing</span>
                        </div>
                        <span className="header__logo-text">STEM Gear</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="header__nav">
                        <Link to="/products" className="header__nav-link">Products</Link>
                        <a className="header__nav-link" href="#">Projects</a>
                        <a className="header__nav-link" href="#">Forums</a>
                        <a className="header__nav-link header__nav-link--quick-order" href="#">
                            <span className="material-symbols-outlined">bolt</span>
                            Quick Order
                        </a>
                    </nav>

                    {/* Actions */}
                    <div className="header__actions">
                        {user ? (
                            /* Logged in user dropdown */
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        backgroundColor: '#f3f4f6',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#0e121b',
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                        account_circle
                                    </span>
                                    <span>{user.username}</span>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                        {showDropdown ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {showDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        minWidth: '200px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                        border: '1px solid #e5e7eb',
                                        overflow: 'hidden',
                                        zIndex: 100,
                                    }}>
                                        <div style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #e5e7eb',
                                        }}>
                                            <p style={{ fontWeight: 600, fontSize: '14px', color: '#0e121b' }}>
                                                {user.username}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                                {user.email}
                                            </p>
                                        </div>
                                        <div style={{ padding: '8px' }}>
                                            {/* Dashboard link for Admin */}
                                            {user.role?.toLowerCase() === 'admin' && (
                                                <Link
                                                    to="/admin/dashboard"
                                                    onClick={() => setShowDropdown(false)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '10px 12px',
                                                        borderRadius: '6px',
                                                        color: '#2463eb',
                                                        textDecoration: 'none',
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        backgroundColor: '#eff6ff',
                                                        marginBottom: '4px',
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    color: '#374151',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                                                My Profile
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setShowDropdown(false)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    color: '#374151',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_bag</span>
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    color: '#DC2626',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Not logged in - show sign in/up buttons */
                            <>
                                <Link to="/login" className="header__sign-in">
                                    Sign In
                                </Link>
                                <Link to="/register" className="header__register">
                                    Sign Up
                                </Link>
                            </>
                        )}
                        <button className="header__cart" onClick={handleCartClick}>
                            <span className="material-symbols-outlined">shopping_cart</span>
                            {cartItemCount > 0 && (
                                <span className="header__cart-badge">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
                            )}
                        </button>
                        <button className="header__menu-toggle">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

