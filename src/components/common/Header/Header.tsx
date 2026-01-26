import { Link } from 'react-router-dom';

const Header = () => {
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
                        <Link to="/components" className="header__nav-link">Components</Link>
                        <a className="header__nav-link" href="#">Projects</a>
                        <a className="header__nav-link" href="#">Forums</a>
                        <a className="header__nav-link header__nav-link--quick-order" href="#">
                            <span className="material-symbols-outlined">bolt</span>
                            Quick Order
                        </a>
                    </nav>

                    {/* Actions */}
                    <div className="header__actions">
                        <Link to="/login" className="header__sign-in">
                            Sign In
                        </Link>
                        <Link to="/register" className="header__register">
                            Sign Up
                        </Link>
                        <button className="header__cart">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <span className="header__cart-badge">2</span>
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
