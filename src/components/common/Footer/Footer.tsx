import { Link } from 'react-router-dom';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer">
            {/* Newsletter Section */}
            <div className="footer__newsletter">
                <div className="footer__newsletter-content">
                    <div className="footer__newsletter-info">
                        <span className="material-symbols-outlined footer__newsletter-icon">mail</span>
                        <div>
                            <h3 className="footer__newsletter-title">Stay in the Loop</h3>
                            <p className="footer__newsletter-text">Get updates on new products and exclusive deals.</p>
                        </div>
                    </div>
                    <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="footer__newsletter-input"
                        />
                        <button type="submit" className="footer__newsletter-btn">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Footer */}
            <div className="footer__main">
                <div className="footer__container">
                    <div className="footer__grid">
                        {/* Brand Section */}
                        <div className="footer__brand">
                            <Link to="/" className="footer__logo-wrapper">
                                <div className="footer__logo-icon">
                                    <span className="material-symbols-outlined">precision_manufacturing</span>
                                </div>
                                <span className="footer__logo-text">STEM Gear</span>
                            </Link>
                            <p className="footer__description">
                                The trusted source for industrial-grade components, development boards, and modules for makers and professional engineers.
                            </p>
                            {/* Social Icons */}
                            <div className="footer__social">
                                <a href="#" className="footer__social-link" aria-label="Facebook">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="#" className="footer__social-link" aria-label="GitHub">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                </a>
                                <a href="#" className="footer__social-link" aria-label="YouTube">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Shop Links */}
                        <div>
                            <h4 className="footer__section-title">Shop</h4>
                            <ul className="footer__links">
                                <li><Link className="footer__link" to="/products">All Products</Link></li>
                                <li><Link className="footer__link" to="/products?type=MODULE">Modules</Link></li>
                                <li><Link className="footer__link" to="/products?type=KIT">Kits</Link></li>
                                <li><Link className="footer__link" to="/products?type=COMPONENT">Components</Link></li>
                            </ul>
                        </div>

                        {/* Support Links */}
                        <div>
                            <h4 className="footer__section-title">Support</h4>
                            <ul className="footer__links">
                                <li><Link className="footer__link" to="/chat">Chat Support</Link></li>
                                <li><Link className="footer__link" to="/store">Store Locator</Link></li>
                                <li><Link className="footer__link" to="/orders">Track Order</Link></li>
                                <li><Link className="footer__link" to="/warranties">Warranties</Link></li>
                            </ul>
                        </div>

                        {/* Account Links */}
                        <div>
                            <h4 className="footer__section-title">Account</h4>
                            <ul className="footer__links">
                                <li><Link className="footer__link" to="/login">Sign In</Link></li>
                                <li><Link className="footer__link" to="/register">Create Account</Link></li>
                                <li><Link className="footer__link" to="/profile">My Profile</Link></li>
                                <li><Link className="footer__link" to="/orders">My Orders</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="footer__bottom">
                        <p className="footer__copyright">© 2026 STEM Gear Inc. All rights reserved.</p>
                        <button className="footer__back-to-top" onClick={scrollToTop}>
                            <span className="material-symbols-outlined">keyboard_arrow_up</span>
                            Back to Top
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
