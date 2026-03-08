import { useState, useEffect } from 'react';
import './ScrollToTop.css';

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            className={`scroll-to-top ${visible ? 'scroll-to-top--visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <span className="material-symbols-outlined">keyboard_arrow_up</span>
        </button>
    );
};

export default ScrollToTop;
