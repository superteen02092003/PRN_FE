import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__content">
                    <div className="footer__section">
                        <h3 className="footer__title">PRN Frontend</h3>
                        <p className="footer__text">
                            Building modern web applications with React, TypeScript, and Tailwind CSS.
                        </p>
                    </div>
                    <div className="footer__section">
                        <h4 className="footer__subtitle">Quick Links</h4>
                        <ul className="footer__links">
                            <li><a href="/">Home</a></li>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer__section">
                        <h4 className="footer__subtitle">Resources</h4>
                        <ul className="footer__links">
                            <li><a href="/docs">Documentation</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/support">Support</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer__bottom">
                    <p>&copy; 2026 PRN Frontend. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
