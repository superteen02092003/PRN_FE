const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__grid">
                    {/* Brand Section */}
                    <div className="footer__brand">
                        <div className="footer__logo-wrapper">
                            <div className="footer__logo-icon">
                                <span className="material-symbols-outlined">precision_manufacturing</span>
                            </div>
                            <span className="footer__logo-text">STEM Gear</span>
                        </div>
                        <p className="footer__description">
                            The trusted source for industrial-grade components, development boards, and modules for makers and professional engineers.
                        </p>
                        <div className="footer__social">
                            <a className="footer__social-link" href="#">
                                <i className="material-symbols-outlined">terminal</i>
                            </a>
                            <a className="footer__social-link" href="#">
                                <i className="material-symbols-outlined">code</i>
                            </a>
                            <a className="footer__social-link" href="#">
                                <i className="material-symbols-outlined">rss_feed</i>
                            </a>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="footer__section-title">Shop</h4>
                        <ul className="footer__links">
                            <li><a className="footer__link" href="#">New Arrivals</a></li>
                            <li><a className="footer__link" href="#">Best Sellers</a></li>
                            <li><a className="footer__link" href="#">Dev Boards</a></li>
                            <li><a className="footer__link" href="#">Sensors</a></li>
                            <li><a className="footer__link" href="#">Clearance</a></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="footer__section-title">Support</h4>
                        <ul className="footer__links">
                            <li><a className="footer__link" href="#">Help Center</a></li>
                            <li><a className="footer__link" href="#">Datasheets</a></li>
                            <li><a className="footer__link" href="#">Return Policy</a></li>
                            <li><a className="footer__link" href="#">Shipping Info</a></li>
                            <li><a className="footer__link" href="#">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div>
                        <h4 className="footer__section-title">Community</h4>
                        <ul className="footer__links">
                            <li><a className="footer__link" href="#">Forums</a></li>
                            <li><a className="footer__link" href="#">Project Showcase</a></li>
                            <li><a className="footer__link" href="#">Blog</a></li>
                            <li><a className="footer__link" href="#">Education</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="footer__bottom">
                    <p className="footer__copyright">© 2024 STEM Gear Inc. All rights reserved.</p>
                    <div className="footer__legal">
                        <a className="footer__legal-link" href="#">Privacy Policy</a>
                        <a className="footer__legal-link" href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

