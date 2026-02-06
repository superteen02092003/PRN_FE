import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@components/common/Header';
import Footer from '@components/common/Footer';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Lazy load Spline for better performance - only loads when needed
const Spline = lazy(() => import('@splinetool/react-spline'));

const HomePage = () => {
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const sectionsRef = useRef<HTMLDivElement>(null);
    const [splineLoaded, setSplineLoaded] = useState(false);
    const [heroContentHidden, setHeroContentHidden] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    // Detect mobile for video fallback
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Check for success message from login/register
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the state to prevent showing message on refresh
            window.history.replaceState({}, document.title);
            // Auto dismiss after 3 seconds
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Auto-hide hero content after 3 seconds, show on hover
    useEffect(() => {
        const timer = setTimeout(() => {
            setHeroContentHidden(true);
        }, 3000);

        const heroElement = heroRef.current;

        const handleMouseEnter = () => setHeroContentHidden(false);
        const handleMouseLeave = () => {
            // Re-hide after a short delay when mouse leaves
            setTimeout(() => setHeroContentHidden(true), 2000);
        };

        if (heroElement) {
            heroElement.addEventListener('mouseenter', handleMouseEnter);
            heroElement.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            clearTimeout(timer);
            if (heroElement) {
                heroElement.removeEventListener('mouseenter', handleMouseEnter);
                heroElement.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    // Scroll reveal animation using Intersection Observer
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all cards that need reveal animation
        const sectionsContainer = sectionsRef.current;
        if (sectionsContainer) {
            const revealElements = sectionsContainer.querySelectorAll(
                '.category-card, .product-card, .arrival-card, .reveal'
            );
            revealElements.forEach((el) => observer.observe(el));
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="home-page">
            {/* Success Toast Notification */}
            {successMessage && (
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    padding: '16px 24px',
                    backgroundColor: '#16A34A',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    animation: 'slideDown 0.3s ease-out',
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                    {successMessage}
                </div>
            )}

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}</style>

            <Header />
            <main className="home-page__main">
                <div className="home-page__sections" ref={sectionsRef}>
                    {/* Hero Search Section with 3D Spline */}
                    <section className="hero-search" ref={heroRef}>
                        {/* 3D Spline Background */}
                        <div className="hero-search__3d-container">
                            {!isMobile ? (
                                <Suspense fallback={
                                    <div className="hero-search__3d-loading">
                                        <div className="hero-search__3d-spinner"></div>
                                    </div>
                                }>
                                    <Spline
                                        scene="https://prod.spline.design/cX2vHOXxH1nnhGEf/scene.splinecode"
                                        onLoad={() => setSplineLoaded(true)}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                        }}
                                    />
                                </Suspense>
                            ) : (
                                <div
                                    className="hero-search__background"
                                    style={{
                                        backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuChGPyK6HLZZn99akyoQexfblTEYbq4TGd6_crW-HEPM4CexDAYeSmPuhsurHOdbXnAHXmN_hSQ1WKmXtaOW6JyMGnGRkO5ztNcFU5UIU1IE8aB674lHC6YOUnLQ8sBD_iTx105MvFt1jW4mcOLlKm7ZnMrdGHLurrr-YVSs8scVhSMTRGevj3ix29gbokhMLYbLPgPKaPNHDEF2VTNlbWlXDkFXb0JCa131yfOWk3M3ZNfLoH3ItByxjdJdybgRMczvLmCbMX1IXM")'
                                    }}
                                />
                            )}
                        </div>
                        <div className={`hero-search__overlay ${heroContentHidden ? 'hero-search__overlay--hidden' : ''}`} />
                        <div className={`hero-search__content ${heroContentHidden ? 'hero-search__content--hidden' : ''}`}>
                            <div>
                                <h1 className="hero-search__title">
                                    Find the right gear for your next build
                                </h1>
                                <p className="hero-search__subtitle">
                                    Industrial-grade components for makers, engineers, and prototypers.
                                </p>
                            </div>

                            <div className="hero-search__bar">
                                <div className="hero-search__icon">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="hero-search__input"
                                    placeholder="Search by SKU, Name, or Component Type..."
                                    type="text"
                                />
                                <div className="hero-search__select-wrapper">
                                    <select className="hero-search__select">
                                        <option>All Categories</option>
                                        <option>Sensors</option>
                                        <option>Boards</option>
                                        <option>Power</option>
                                    </select>
                                </div>
                                <button className="hero-search__button">
                                    Search
                                </button>
                            </div>

                            <div className="hero-search__popular">
                                <span>Popular:</span>
                                <a className="hero-search__popular-link" href="#">ESP32</a>
                                <a className="hero-search__popular-link" href="#">Raspberry Pi 5</a>
                                <a className="hero-search__popular-link" href="#">Stepper Motors</a>
                            </div>
                        </div>
                    </section>

                    {/* Category Grid */}
                    <section>
                        <div className="section-header">
                            <h2 className="section-header__title">
                                <span className="material-symbols-outlined">category</span>
                                Browse by Category
                            </h2>
                            <a className="section-header__link" href="#">View All Categories</a>
                        </div>
                        <div className="category-grid">
                            {categories.map((category, index) => (
                                <a key={index} className="category-card" href="#">
                                    <div className="category-card__image-wrapper">
                                        <img
                                            className="category-card__image"
                                            alt={category.alt}
                                            src={category.image}
                                        />
                                    </div>
                                    <span className="category-card__name">{category.name}</span>
                                </a>
                            ))}
                        </div>
                    </section>

                    {/* Flash Deals */}
                    <section className="flash-deals">
                        <div className="flash-deals__header">
                            <div className="flash-deals__title-wrapper">
                                <div className="flash-deals__icon">
                                    <span className="material-symbols-outlined">flash_on</span>
                                </div>
                                <div>
                                    <h2 className="flash-deals__title">Flash Deals</h2>
                                    <p className="flash-deals__subtitle">Limited quantity offers ending soon</p>
                                </div>
                            </div>
                            <div className="flash-deals__timer">
                                <span className="flash-deals__timer-label">Ends in:</span>
                                <span className="flash-deals__timer-value">04:22:10</span>
                            </div>
                        </div>
                        <div className="flash-deals__grid">
                            {flashDeals.map((product, index) => (
                                <div key={index} className="product-card">
                                    <div className="product-card__image-wrapper">
                                        <span className="product-card__badge">{product.discount}</span>
                                        <img
                                            className="product-card__image"
                                            alt={product.alt}
                                            src={product.image}
                                        />
                                    </div>
                                    <div className="product-card__content">
                                        <h3 className="product-card__title">{product.name}</h3>
                                        <p className="product-card__sku">{product.sku}</p>
                                        <div className="product-card__pricing">
                                            <div className="product-card__price-wrapper">
                                                <span className="product-card__old-price">{product.oldPrice}</span>
                                                <div className="product-card__price">{product.price}</div>
                                            </div>
                                            <button className="product-card__add-btn">
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="product-card__stock">
                                        <div
                                            className="product-card__stock-bar"
                                            style={{ width: `${product.stockPercent}%` }}
                                        />
                                    </div>
                                    <p className="product-card__stock-text">{product.stockLeft} left in stock</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* New Arrivals */}
                    <section>
                        <div className="section-header">
                            <h2 className="section-header__title">New Arrivals</h2>
                            <div className="section-header__controls">
                                <button className="section-header__control-btn">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className="section-header__control-btn">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="new-arrivals-grid">
                            {newArrivals.map((product, index) => (
                                <article key={index} className="arrival-card">
                                    <div className="arrival-card__image">
                                        <img src={product.image} alt={product.alt} />
                                    </div>
                                    <div className="arrival-card__content">
                                        <div>
                                            <div className="arrival-card__header">
                                                <h3 className="arrival-card__title">{product.name}</h3>
                                                <span className="arrival-card__badge">{product.badge}</span>
                                            </div>
                                            <p className="arrival-card__description">{product.description}</p>
                                        </div>
                                        <div className="arrival-card__footer">
                                            <span className="arrival-card__price">{product.price}</span>
                                            <button className="arrival-card__link">View Datasheet</button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Newsletter */}
                    <section className="newsletter">
                        <div
                            className="newsletter__background"
                            style={{
                                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuATUj_7PJ8BtLkthfG_jLxDprnfTDFF_t_qafLcRhSqbnlVO-GHF0E09vXb3Ceboo1smnacTUnWl0-Mi6T5KzJfqx4KQetyb0g9mR61Q9Vc7D3qlKoQjhRLq-isgEvJ60N30uNBdEP6yop10thz1XkrA6C-WpNTNv0cJRozrnhvvC17yZngjGv55FKt5Zm62wqhPtKhvfCueZlIaDvZYcb_L6jbOMDFHKcPt-zNZJ7a1kC_jAv5vEJdYOKegi8qan7gSGLCG7LCjFw")'
                            }}
                        />
                        <div className="newsletter__content">
                            <div className="newsletter__text">
                                <h2 className="newsletter__title">Stay in the loop</h2>
                                <p className="newsletter__subtitle">
                                    Get weekly updates on new arrivals, engineering tutorials, and exclusive component datasheets.
                                </p>
                            </div>
                            <div className="newsletter__form">
                                <input
                                    className="newsletter__input"
                                    placeholder="Enter your email"
                                    type="email"
                                />
                                <button className="newsletter__button">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Sample data
const categories = [
    {
        name: 'Sensors',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6EM81M0H5g0Z9_ggTVm2AtikZIhWbvF60qLhjI1MtzJyza7ZoYpMOP8DppfmVAqSgEAIxVaB_Y_m3luAZ3atd9SO3wjgaqOFlPBdc9_iLZtOS8NvOyjSuweP-IeP2IliKB0lUDKCItyoFOjZPQEn5ZkRt-gzagBVMlMX8kQ3izVwRzzmuw1KvHoCJDFq3nt9rlSVY-j9g_LC44RWiQZl9yzn4-s1Ex77fLqpn7oQ1uinjh5x7eiRvUQrbqCcvI8pFfc_dPUxMfpk',
        alt: 'Electronic sensor component'
    },
    {
        name: 'Dev Boards',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrepVnx3ENWfVScfVRYfFar_uEH4RTkcJryL5daiQ12HlckueoNliyvb0nB_S2eYr82o_JIEsvhXvWHgugEsT3Mf1rJO_cd3pZbwEv_EtpbzUkjkk7EFrDrZlNviuAfo_XlKz3ydhEjoqZrRSZlfwhdxtTRWPc4-mkH5Mo-MD88WE3TZB4sZIGsNEgmSfOK3COhcE7LszC0e-P-WAbW9QYTLU8JLhqAsftZ_E8d0jQfSVK6UU9HnbyyTPIIOrJxkGMr8UhV2op6KE',
        alt: 'Development board'
    },
    {
        name: 'Power Modules',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYEJNESXMSgMVtQ94nmsYBKP0o3dVwLYKmp3Xsz9hjlL8NjyzhhE-ybWPc9roGPKCxYO1bPlcOQ7uHNMllVGY_BymGF0sWZQSVYfrRRkWJrpnT-7huiCiwTfsIVRFvP8BLaB2upyvuurIwR3eK6ULAcyyhi_sRseefWiySpe2YJZ2UTs0xr5Wmcco0DzU0NAseJPOuo1QdqqPFZLuPIFoTVugtvEzw4nFuodUu01Nh7SaIiFrA_50tyEGHWaqnLQT6bQzos4xQuO8',
        alt: 'Power module component'
    },
    {
        name: 'Prototyping',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3REXYs3tVdJ4Y7M3FVMyhlfnF0j3Dh0KSxVCQJvFC5vxZwMqaGS7KfT4qc_n339uKQX-mcDR7BQ-1nd3f3R8h5-NCU4vS-SqBspGTo3_BtESFesxakQFe27_Av3J0AOVkB04QJ6eaEDiDXAHes-oxV7gi7fcq9S-4YdhLI2t0K2kpy6tWkL-FT9SMxv0P9YssUh7n2iB0VXkam2444bRBCk-XMW15-BOW1KNnQHepQLDJd42AYH7mYXqHKdB-m8LwW1JetQe7eaQ',
        alt: 'Prototyping equipment'
    },
    {
        name: 'Robotics',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXWIgbmrCcjAxnxR0Rg5F5s9QzEYYmhaDEGBIXXNOFnv5adltkoL1mqrKqAJrMSFFn_uGBcDVTn0gw8jfnBAgfdLsAtTctu3fQIwqEjdGWSZW3uY8_VtnJPxOIACAKjFrXq4mFYCAmboWLkxTpAc3CVMI_DbqBrX_3WcB30mjJ8163jFuego1K_VDX27tkut2wb5YBTRN3Z-ZMFad00VLsrFB496lEpwHEa_9V-96AxAsV35dNpmvXUwwTXPMZVZbX_NsJIl25FpE',
        alt: 'Robotics motor component'
    },
    {
        name: 'Connectors',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn_lKSUDpgzxxHV4ekfHioqsNUuc3TCzp8vyMvx8VS3szv3OOlIK7xgCO5JDX6RV5UEfive6pRLDHujt0tXEguUJ6ZsQZa7vn2JqJlivYCr8hnWY_4U9QhEm7L1UizOw6EkH5TbFdCIt685D41XiAFJ29U3N1KDnuVLNCRYckcvE64T_HPraMkEKfsqQ630lnXdpkSXs-LYWdYWAoPPXPc-CTw2Fdm0hufh57kGqHUQnz0ls7luapVxM8vVyg2rE8I9ARqawkl2iA',
        alt: 'Connector ports'
    }
];

const flashDeals = [
    {
        name: 'Raspberry Pi 5 Starter Kit - 8GB RAM',
        sku: 'SKU: RPI-5-8GB-KIT',
        discount: '-20%',
        oldPrice: '$120.00',
        price: '$96.00',
        stockPercent: 75,
        stockLeft: 12,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwes7NFji-vtygmyQov5GNKE_wgyINklHcP7mKBddNX3uMfRzUTnbzDuaMlGKy7bzratm_qjMmVjGJ5EQkXPU0wm-fVrqN3VgGaqxOjjm4qsyJq_mW_Chwe9vDm_0eTlwBJ7nt_yrxhssQY2ZOO9wcnVCFTf6q6eX-uy4O1wOOTuzIFitMPVSRvTdV8H7Qd35Qx1mkpCz6wARMVrsQoZAz87y4NsYkLERRmGLy_wGFGTapMlwd9LavhjtIY4iddLsKzF2TeMgvBzM',
        alt: 'Raspberry Pi computer board'
    },
    {
        name: 'Arduino Uno R3 Compatible Board',
        sku: 'SKU: ARD-UNO-R3-CLONE',
        discount: '-15%',
        oldPrice: '$24.00',
        price: '$20.40',
        stockPercent: 45,
        stockLeft: 45,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvlm5lzxMz39h6rVEajKu3yASgDDFWl6GjisEfuvRglbxz0_R8kptGKYJ34foUhg9wUTAyuvqdnTZzRiMWXVexgb2Ek_1i-lP0JyUY7XOKHIJclLjE9vz5ffy4qXr0kn0nnT5-X_kTs0IlvSONl1SA-mcy7GlsgBIATvykjBZ-uza5Z--walgZpUVidOtZCXLgB567rWuMcjbA69XM6QP5EIXUfDp2MCP_LtBIdYfcoSLKcEzLkrT4h9D5NcI8GKE7Exg6uM33_ys',
        alt: 'Arduino compatible microcontroller board'
    },
    {
        name: 'Jumper Wire Kit - 120pcs',
        sku: 'SKU: WIRE-JUMP-120',
        discount: '-30%',
        oldPrice: '$8.50',
        price: '$5.95',
        stockPercent: 90,
        stockLeft: 5,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOATWWVCkO6jS91xAdnFpBcoANcGLkmO9v0SvBnKABppUhlNB_FENIPW27aBm_CBt7pSMfE8oT4N_EppPqqqTgIJL_meXbuil1M4-otHifSKGpZ05WFqXgzHejQgy5XlDkYi5a2aAizTWrIrobXtUp1n91ncJsXy4xCVBfS-ymFExiMG9CmrxN69-q86FaLU_3qqDlxVFptTsneIG3CxKYhgxEUA6TEz2SMF24hSHf1Sqrrk-5QSryLPTkqEcJOo8FahbDZRR2Qro',
        alt: 'Bundle of multicolored jumper wires'
    },
    {
        name: 'Pro Soldering Station 60W',
        sku: 'SKU: TOOL-SOLD-60W',
        discount: '-10%',
        oldPrice: '$45.00',
        price: '$40.50',
        stockPercent: 20,
        stockLeft: 80,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOFEgLUThffqWl3RHpSgEcqQYE_s79VCOjv-lPpabHeMQsPenNPOMxAo3ZvumMSVgDf4TLBVaTnlTdz4tncCJr8L1DaACQmmQRL97hxXQ2dGsspyflY2zIfOO1ZDwpG9xYPL25JCl5wPJLWAiRDuP0wAtmmmqnrJgSyeiCkDCF2okF-SKqDk2VoKS4xRsfU9vhiTHx4WItYyutxLT_xK50nnjkjlUixeUq038hfRZmzUjItsFQHhJepWFXzb070cEggsFnk2jVGZ8',
        alt: 'Soldering iron station'
    }
];

const newArrivals = [
    {
        name: 'ESP32-S3-WROOM-1',
        badge: 'WiFi+BT',
        description: 'Powerful generic Wi-Fi + Bluetooth LE MCU module that targets a wide variety of applications.',
        price: '$3.95',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8i7LK6KGuF29B8oi8YLTzYWKU9Lg9QsRNhSgcQjxueZbKdP4JEeU8TJ7fgq0YIgTS9VxMXAzAAqSyvYimQMMFIHF5csSzotSC_Ztr_tFZDlmUSc03yBkgM4uYL6x95yQqtTNe_p-sMdk-50BjUN1jlo2V3A7pOU3qzfKaqLmTgN6gWBZzkO2zcVSDhOC8tYyeitnDRlVXX4Esqf2ILP0DpcjRUWGMyfakgS3g94h9z4-vJIMrZyw4IdHY8vAmFuQj0E-70bFLxBA',
        alt: 'Small ESP32 wireless module'
    },
    {
        name: 'TF-Luna LiDAR Module',
        badge: 'ToF',
        description: 'Single-point ranging LiDAR, based on ToF principle. 8m range, high stability.',
        price: '$22.50',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhWkLDvxiLsHjmfMO7BxUE5sbxxwR6TjbOumqmrnC1k1xQNVX-2lwzsjcLuy8hiF5x9V5R33tjKbie5PV6IafLwgj20gTjfYfjzN5WcAA7S-G2ae6NCMI1aNj2Xz7y3O74B9NZ4PtKpIY1Atddap4OWLOGjvhNo2AU94nUD6xNaLf5k59FQX8SouFc9EeC8_SYSgWMH9InJHxioFiD59IW7LtRl1FqHdkmLySobPdk5mqFlhcIZFEwkda3UXypwWMnPzllh5Mgl_M',
        alt: 'LiDAR sensor module'
    },
    {
        name: '2.9" E-Ink Display',
        badge: 'SPI',
        description: 'Three-color (Red, Black, White) e-paper display module for low power projects.',
        price: '$18.90',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS1BtyqsmtZ3FwmG4SBFOAVf1br-dQoTiYC5FswA_tSbKunscu81xZ6TTKtvG38XPrh_tg9JI9b4njtmkwcydctAfuCyCtbbWsV5YnmmmdXyTchIa9Vc375gWz8-cHgmNjXK-TvvPMd8ZeqKNuvKF7ge0xCKsYTnATahwzM3d43YSyinlmbQMrgABcjBc13frLStCJ5gJXY4FPQz5ZVa2FNnWeJt79gzNtEJqZ2KgIOGrXXTUiVryYyjwB7IDlRQMTKq3jVAQg4ro',
        alt: 'E-Ink display panel'
    }
];

export default HomePage;
