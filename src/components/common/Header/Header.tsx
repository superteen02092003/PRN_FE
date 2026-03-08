import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import { getCategories, getBrands } from '@/services/productService';
import type { CategoryResponseDto, BrandResponseDto } from '@/types/product.types';

interface User {
    userId: number;
    username: string;
    email: string;
    role: string;
    avatar?: string;
}

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    // Mega dropdown
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const megaMenuRef = useRef<HTMLDivElement>(null);
    const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);

    // API data for mega dropdown
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [brands, setBrands] = useState<BrandResponseDto[]>([]);
    const [megaDataLoaded, setMegaDataLoaded] = useState(false);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Scroll state
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
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
        window.addEventListener('storage', checkAuth);
        window.addEventListener('authChange', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('authChange', checkAuth);
        };
    }, []);

    // Cart count listener
    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const total = cart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0);
            setCartItemCount(total);
        };
        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cartUpdated', updateCartCount);
        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    // Chat unread count
    useEffect(() => {
        if (!user) { setChatUnreadCount(0); return; }
        const updateUnread = () => {
            const count = parseInt(localStorage.getItem('chatUnreadCount') || '0', 10);
            setChatUnreadCount(count);
        };
        updateUnread();
        window.addEventListener('storage', updateUnread);
        window.addEventListener('chatUnreadUpdated', updateUnread);
        return () => {
            window.removeEventListener('storage', updateUnread);
            window.removeEventListener('chatUnreadUpdated', updateUnread);
        };
    }, [user]);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mega menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node) &&
                megaMenuTriggerRef.current && !megaMenuTriggerRef.current.contains(e.target as Node)
            ) {
                setShowMegaMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close user dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.header__user-area')) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showDropdown]);

    // Fetch mega menu data on first hover
    const loadMegaData = async () => {
        if (megaDataLoaded) return;
        try {
            const [cats, brs] = await Promise.allSettled([getCategories(), getBrands()]);
            if (cats.status === 'fulfilled') setCategories(cats.value.slice(0, 6));
            if (brs.status === 'fulfilled') setBrands(brs.value.slice(0, 6));
            setMegaDataLoaded(true);
        } catch { /* silent */ }
    };

    const handleMegaEnter = () => {
        loadMegaData();
        setShowMegaMenu(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setShowDropdown(false);
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
    };

    const handleCartClick = () => {
        if (!user) {
            navigate('/login', { state: { message: 'Please log in to view your cart' } });
        } else {
            navigate('/cart');
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    const getUserInitial = () => {
        if (!user) return '?';
        return user.username.charAt(0).toUpperCase();
    };

    return (
        <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
            <div className="header__container">
                <div className="header__content">
                    {/* Logo */}
                    <Link to="/" className="header__logo-wrapper">
                        <div className="header__logo-icon">
                            <span className="material-symbols-outlined">precision_manufacturing</span>
                        </div>
                        <span className="header__logo-text">STEM Gear</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="header__nav">
                        {/* Products Mega Dropdown */}
                        <div className="header__mega-wrapper"
                            onMouseEnter={handleMegaEnter}
                            onMouseLeave={() => setShowMegaMenu(false)}
                        >
                            <button
                                ref={megaMenuTriggerRef}
                                className={`header__nav-link header__nav-link--dropdown ${showMegaMenu ? 'active' : ''}`}
                                onClick={() => navigate('/products')}
                            >
                                Products
                                <span className="material-symbols-outlined header__nav-arrow">expand_more</span>
                            </button>

                            {showMegaMenu && (
                                <div className="header__mega-menu" ref={megaMenuRef}>
                                    <div className="mega-menu__grid">
                                        {/* Categories Column */}
                                        <div className="mega-menu__col">
                                            <h4 className="mega-menu__heading">
                                                <span className="material-symbols-outlined">category</span>
                                                Shop by Category
                                            </h4>
                                            <div className="mega-menu__links">
                                                {categories.length > 0 ? categories.map(cat => (
                                                    <Link
                                                        key={cat.categoryId}
                                                        to={`/products?categoryId=${cat.categoryId}`}
                                                        className="mega-menu__link"
                                                        onClick={() => setShowMegaMenu(false)}
                                                    >
                                                        <span>{cat.name}</span>
                                                        <span className="mega-menu__count">{cat.productCount}</span>
                                                    </Link>
                                                )) : (
                                                    <span className="mega-menu__loading">Loading...</span>
                                                )}
                                            </div>
                                            <Link to="/products" className="mega-menu__view-all" onClick={() => setShowMegaMenu(false)}>
                                                View All Products →
                                            </Link>
                                        </div>

                                        {/* Brands Column */}
                                        <div className="mega-menu__col">
                                            <h4 className="mega-menu__heading">
                                                <span className="material-symbols-outlined">verified</span>
                                                Popular Brands
                                            </h4>
                                            <div className="mega-menu__links">
                                                {brands.length > 0 ? brands.map(brand => (
                                                    <Link
                                                        key={brand.brandId}
                                                        to={`/products?brandId=${brand.brandId}`}
                                                        className="mega-menu__link"
                                                        onClick={() => setShowMegaMenu(false)}
                                                    >
                                                        <span>{brand.name}</span>
                                                        <span className="mega-menu__count">{brand.productCount}</span>
                                                    </Link>
                                                )) : (
                                                    <span className="mega-menu__loading">Loading...</span>
                                                )}
                                            </div>
                                            <Link to="/products" className="mega-menu__view-all" onClick={() => setShowMegaMenu(false)}>
                                                All Brands →
                                            </Link>
                                        </div>

                                        {/* Product Types Column */}
                                        <div className="mega-menu__col mega-menu__col--highlight">
                                            <h4 className="mega-menu__heading">
                                                <span className="material-symbols-outlined">widgets</span>
                                                By Type
                                            </h4>
                                            <div className="mega-menu__type-cards">
                                                <Link to="/products?type=MODULE" className="mega-menu__type-card" onClick={() => setShowMegaMenu(false)}>
                                                    <span className="material-symbols-outlined">memory</span>
                                                    <span>Modules</span>
                                                </Link>
                                                <Link to="/products?type=KIT" className="mega-menu__type-card" onClick={() => setShowMegaMenu(false)}>
                                                    <span className="material-symbols-outlined">inventory_2</span>
                                                    <span>Kits</span>
                                                </Link>
                                                <Link to="/products?type=COMPONENT" className="mega-menu__type-card" onClick={() => setShowMegaMenu(false)}>
                                                    <span className="material-symbols-outlined">settings_input_component</span>
                                                    <span>Components</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/store" className="header__nav-link">Store</Link>
                    </nav>

                    {/* Inline Search */}
                    <div className="header__search">
                        <span className="material-symbols-outlined header__search-icon">search</span>
                        <input
                            className="header__search-input"
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Actions */}
                    <div className="header__actions">
                        {user ? (
                            <>
                                {/* Notification */}
                                <NotificationDropdown />

                                {/* Chat */}
                                <Link to="/chat" className="header__action-btn" title="Chat Support">
                                    <span className="material-symbols-outlined">chat</span>
                                    {chatUnreadCount > 0 && (
                                        <span className="header__badge">{chatUnreadCount > 99 ? '99+' : chatUnreadCount}</span>
                                    )}
                                </Link>

                                {/* Cart */}
                                <button className="header__action-btn" onClick={handleCartClick} title="Cart">
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    {cartItemCount > 0 && (
                                        <span className="header__badge">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
                                    )}
                                </button>

                                {/* User Avatar */}
                                <div className="header__user-area">
                                    <button
                                        className="header__avatar-btn"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    >
                                        <div className="header__avatar">
                                            {getUserInitial()}
                                        </div>
                                    </button>

                                    {showDropdown && (
                                        <div className="header__user-dropdown">
                                            <div className="header__user-info">
                                                <div className="header__avatar header__avatar--lg">
                                                    {getUserInitial()}
                                                </div>
                                                <div>
                                                    <p className="header__user-name">{user.username}</p>
                                                    <p className="header__user-email">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="header__user-links">
                                                {user.role?.toLowerCase() === 'admin' && (
                                                    <Link to="/admin/dashboard" className="header__user-link header__user-link--admin" onClick={() => setShowDropdown(false)}>
                                                        <span className="material-symbols-outlined">dashboard</span>
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <Link to="/profile" className="header__user-link" onClick={() => setShowDropdown(false)}>
                                                    <span className="material-symbols-outlined">person</span>
                                                    My Profile
                                                </Link>
                                                <Link to="/orders" className="header__user-link" onClick={() => setShowDropdown(false)}>
                                                    <span className="material-symbols-outlined">shopping_bag</span>
                                                    My Orders
                                                </Link>
                                                <Link to="/warranties" className="header__user-link" onClick={() => setShowDropdown(false)}>
                                                    <span className="material-symbols-outlined">shield</span>
                                                    My Warranties
                                                </Link>
                                                <button className="header__user-link header__user-link--logout" onClick={handleLogout}>
                                                    <span className="material-symbols-outlined">logout</span>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="header__sign-in">Sign In</Link>
                                <Link to="/register" className="header__register">Sign Up</Link>
                            </>
                        )}

                        {/* Mobile menu toggle */}
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
