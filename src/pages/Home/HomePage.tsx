import Header from '@components/common/Header';
import Footer from '@components/common/Footer';

const HomePage = () => {
    return (
        <div className="home-page">
            <Header />
            <main className="home-page__content">
                <div className="container">
                    <div className="home-page__hero">
                        <h1 className="home-page__title">Welcome to PRN Frontend</h1>
                        <p className="home-page__subtitle">
                            A modern React application built with Vite, TypeScript, and Tailwind CSS
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button className="btn btn-primary">Get Started</button>
                            <button className="btn btn-outline">Learn More</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
