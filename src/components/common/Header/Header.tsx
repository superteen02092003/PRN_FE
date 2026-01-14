import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <nav className="header__nav">
                    <a href="/" className="header__logo">PRN Frontend</a>
                    <ul className="header__menu">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
