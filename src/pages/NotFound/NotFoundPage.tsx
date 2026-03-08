import { Link } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import './NotFoundPage.css';

const NotFoundPage = () => {
    return (
        <>
            <Header />
            <main className="not-found-page">
                <div className="not-found-content">
                    <div className="not-found-illustration">
                        <span className="not-found-code">404</span>
                        <div className="not-found-icon-circle">
                            <span className="material-symbols-outlined">explore_off</span>
                        </div>
                    </div>
                    <h1 className="not-found-title">Page Not Found</h1>
                    <p className="not-found-text">
                        The page you're looking for doesn't exist or has been moved.
                        <br />
                        Let's get you back on track.
                    </p>
                    <div className="not-found-actions">
                        <Link to="/" className="not-found-home-btn">
                            <span className="material-symbols-outlined">home</span>
                            Go Home
                        </Link>
                        <Link to="/products" className="not-found-shop-btn">
                            <span className="material-symbols-outlined">storefront</span>
                            Browse Products
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default NotFoundPage;
