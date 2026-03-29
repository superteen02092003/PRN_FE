import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '@components/common/Header';
import Footer from '@components/common/Footer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAddToCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, getCategories, getBrands } from '@/services/productService';
import type { ProductResponseDto, CategoryResponseDto, BrandResponseDto } from '@/types/product.types';

const HomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useAddToCart();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const sectionsRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');

    // API data states
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [brands, setBrands] = useState<BrandResponseDto[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<ProductResponseDto[]>([]);
    const [newArrivals, setNewArrivals] = useState<ProductResponseDto[]>([]);
    const [bestSellers, setBestSellers] = useState<ProductResponseDto[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalBrands, setTotalBrands] = useState(0);
    const [loading, setLoading] = useState(true);



    // Stats counter
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef<HTMLElement>(null);

    // Testimonials
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    // New Arrivals slider
    const arrivalsRef = useRef<HTMLDivElement>(null);


    // Scroll progress
    const [scrollProgress, setScrollProgress] = useState(0);



    // ===== FETCH REAL DATA FROM API =====
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [categoriesData, brandsData, productsData1, productsData2] = await Promise.allSettled([
                    getCategories(),
                    getBrands(),
                    getProducts({ pageSize: 4, pageNumber: 1 }),
                    getProducts({ pageSize: 8, pageNumber: 1 }),
                ]);

                if (categoriesData.status === 'fulfilled') {
                    setCategories(categoriesData.value);
                }
                if (brandsData.status === 'fulfilled') {
                    setBrands(brandsData.value);
                    setTotalBrands(brandsData.value.length);
                }
                if (productsData1.status === 'fulfilled') {
                    setFeaturedProducts(productsData1.value.items);
                    setTotalProducts(productsData1.value.totalCount);
                }
                if (productsData2.status === 'fulfilled') {
                    const allProducts = productsData2.value.items;
                    setBestSellers(allProducts.slice(0, 4));
                    setNewArrivals(allProducts.slice(4, 8));
                }
            } catch (err) {
                console.error('Failed to fetch landing page data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Success message from login/register
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            window.history.replaceState({}, document.title);
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Profile incomplete warning
    useEffect(() => {
        if (user && (!user.phone || !user.address)) {
            const hasShown = sessionStorage.getItem('profilePromptShown');
            if (!hasShown) {
                toast.info(
                    <div>
                        <p style={{ marginBottom: '8px', color: '#1f2937' }}>Please update your address and phone number for a better shopping experience.</p>
                        <button 
                            onClick={() => navigate('/profile')}
                            style={{ padding: '6px 12px', background: '#2563eb', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                        >
                            Update Now
                        </button>
                    </div>,
                    { autoClose: false, position: 'bottom-right', closeOnClick: false }
                );
                sessionStorage.setItem('profilePromptShown', 'true');
            }
        }
    }, [user, navigate]);

    // Stats counter observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    // Testimonial auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Scroll: progress bar
    useEffect(() => {
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll reveal
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
            { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
        );
        const container = sectionsRef.current;
        if (container) {
            container.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
        }
        return () => observer.disconnect();
    }, [loading]); // re-observe when loading finishes

    const scrollArrivals = (dir: number) => {
        if (arrivalsRef.current) {
            arrivalsRef.current.scrollBy({ left: dir * 350, behavior: 'smooth' });
        }
    };



    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };



    // Category icons mapping
    const categoryIcons: Record<string, string> = {
        'Sensors': 'sensors',
        'Dev Boards': 'developer_board',
        'Power Modules': 'bolt',
        'Prototyping': 'build',
        'Robotics': 'smart_toy',
        'Connectors': 'cable',
        'Modules': 'memory',
        'Kits': 'inventory_2',
        'Components': 'settings_input_component',
    };

    const getCategoryIcon = (name: string) => {
        // Try exact match first, then partial match
        for (const [key, icon] of Object.entries(categoryIcons)) {
            if (name.toLowerCase().includes(key.toLowerCase())) return icon;
        }
        return 'category';
    };

    return (
        <div className="home-page">
            {/* Scroll Progress Bar */}
            <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

            {/* Success Toast */}
            {successMessage && (
                <div className="success-toast">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            <Header />
            <main className="home-page__main" ref={sectionsRef}>
                {/* ===== 1. HERO ===== */}
                <section className="hero-search">
                    {/* Video Background - Only on desktop */}
                    {!isMobile && (
                        <video 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="hero-search__video"
                        >
                            <source src="https://cdn.pixabay.com/video/2023/05/02/160716-823980940_large.mp4" type="video/mp4" />
                        </video>
                    )}
                    
                    {/* Fallback 3D/Image for mobile or if video fails */}
                    <div className="hero-search__3d-container" style={{ display: isMobile ? 'block' : 'none' }}>
                        {isMobile && (
                            <div className="hero-search__background" style={{
                                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuChGPyK6HLZZn99akyoQexfblTEYbq4TGd6_crW-HEPM4CexDAYeSmPuhsurHOdbXnAHXmN_hSQ1WKmXtaOW6JyMGnGRkO5ztNcFU5UIU1IE8aB674lHC6YOUnLQ8sBD_iTx105MvFt1jW4mcOLlKm7ZnMrdGHLurrr-YVSs8scVhSMTRGevj3ix29gbokhMLYbLPgPKaPNHDEF2VTNlbWlXDkFXb0JCa131yfOWk3M3ZNfLoH3ItByxjdJdybgRMczvLmCbMX1IXM")'
                            }} />
                        )}
                    </div>
                    <div className="hero-search__overlay" />
                    <div className="hero-search__content">
                        <div>
                            <h1 className="hero-search__title">Find the right gear for your next build</h1>
                            <p className="hero-search__subtitle">Industrial-grade components for makers, engineers, and prototypers.</p>
                        </div>
                        <div className="hero-quick-shop">
                            <Link to="/products?type=MODULE" className="hero-quick-shop__card">
                                <span className="material-symbols-outlined">memory</span>
                                <span className="hero-quick-shop__label">Modules</span>
                            </Link>
                            <Link to="/products?type=KIT" className="hero-quick-shop__card">
                                <span className="material-symbols-outlined">inventory_2</span>
                                <span className="hero-quick-shop__label">Kits</span>
                            </Link>
                            <Link to="/products?type=COMPONENT" className="hero-quick-shop__card">
                                <span className="material-symbols-outlined">settings_input_component</span>
                                <span className="hero-quick-shop__label">Components</span>
                            </Link>
                        </div>
                        <div className="hero-cta-row">
                            <Link to="/products" className="hero-cta hero-cta--primary">
                                <span className="material-symbols-outlined">storefront</span>
                                Shop All Products
                            </Link>
                            <Link to="/store" className="hero-cta hero-cta--secondary">
                                <span className="material-symbols-outlined">location_on</span>
                                Find Our Store
                            </Link>
                        </div>
                        <div className="hero-search__popular">
                            <span>Trending:</span>
                            <Link className="hero-search__popular-link" to="/products?search=ESP32">ESP32</Link>
                            <Link className="hero-search__popular-link" to="/products?search=Raspberry">Raspberry Pi</Link>
                            <Link className="hero-search__popular-link" to="/products?search=Motor">Stepper Motors</Link>
                        </div>
                    </div>
                </section>

                {/* ===== 2. WHY STEM GEAR ===== */}
                <section className="why-section" id="about">
                    <div className="why-section__grid">
                        {whyStemGear.map((item, i) => (
                            <div key={i} className="why-card reveal-item">
                                <div className="why-card__icon">
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <h3 className="why-card__title">{item.title}</h3>
                                <p className="why-card__desc">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== 3. HOW IT WORKS ===== */}
                <section className="how-section">
                    <h2 className="how-section__title">How It Works</h2>
                    <div className="how-section__steps">
                        {howItWorks.map((step, i) => (
                            <div key={i} className="how-step reveal-item">
                                <div className="how-step__number">{i + 1}</div>
                                <span className="material-symbols-outlined how-step__icon">{step.icon}</span>
                                <h3 className="how-step__title">{step.title}</h3>
                                <p className="how-step__desc">{step.description}</p>
                                {i < howItWorks.length - 1 && <div className="how-step__connector" />}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== 4. CATEGORIES (FROM API) ===== */}
                <section>
                    <div className="section-header">
                        <h2 className="section-header__title">
                            <span className="material-symbols-outlined">category</span>
                            Browse by Category
                        </h2>
                        <div className="section-header__controls">
                            <button className="section-header__control-btn" onClick={() => {
                                const el = document.querySelector('.category-carousel__track') as HTMLElement;
                                if (el) el.scrollBy({ left: -280, behavior: 'smooth' });
                            }}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="section-header__control-btn" onClick={() => {
                                const el = document.querySelector('.category-carousel__track') as HTMLElement;
                                if (el) el.scrollBy({ left: 280, behavior: 'smooth' });
                            }}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                            <Link to="/products" className="section-header__link" style={{ marginLeft: '0.5rem' }}>View All</Link>
                        </div>
                    </div>
                    <div className="category-carousel">
                        <div className="category-carousel__track">
                            {categories.length > 0 ? categories
                                .sort((a, b) => b.productCount - a.productCount)
                                .map((cat) => (
                                    <Link key={cat.categoryId} className="category-carousel__card" to={`/products?categoryId=${cat.categoryId}`}>
                                        <div className="category-carousel__image">
                                            {cat.imageUrl ? (
                                                <img src={cat.imageUrl} alt={cat.name} />
                                            ) : (
                                                <span className="material-symbols-outlined category-carousel__icon">
                                                    {getCategoryIcon(cat.name)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="category-carousel__name">{cat.name}</span>
                                        <span className="category-carousel__count">{cat.productCount} products</span>
                                    </Link>
                                )) : (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="category-carousel__card category-carousel__card--skeleton">
                                        <div className="skeleton-box" style={{ width: '100%', aspectRatio: '1.2', borderRadius: '0.5rem' }} />
                                        <div className="skeleton-box" style={{ width: '60%', height: '0.875rem', borderRadius: '0.25rem' }} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* ===== 5. BRAND LOGOS (FROM API) ===== */}
                <section className="brands-strip">
                    <p className="brands-strip__label">Trusted components from world-leading manufacturers</p>
                    <div className="brands-strip__marquee">
                        <div className="brands-strip__track">
                            {(() => {
                                if (brands.length === 0) return null;
                                return [...brands, ...brands, ...brands, ...brands].map((brand, i) => (
                                    <div key={i} className="brands-strip__item">
                                        <span className="material-symbols-outlined">verified</span>
                                        <span>{brand.name}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </section>

                {/* ===== 6. FEATURED PRODUCTS (FROM API) ===== */}
                <section className="flash-deals" id="deals">
                    <div className="flash-deals__header">
                        <div className="flash-deals__title-wrapper">
                            <div className="flash-deals__icon">
                                <span className="material-symbols-outlined">star</span>
                            </div>
                            <div>
                                <h2 className="flash-deals__title">Featured Products</h2>
                                <p className="flash-deals__subtitle">Handpicked components for your next project</p>
                            </div>
                        </div>
                        <Link to="/products" className="section-header__link">View All</Link>
                    </div>
                    <div className="flash-deals__grid">
                        {featuredProducts.length > 0 ? featuredProducts.map((product) => {
                            const stockPercent = product.stockQuantity > 0 ? Math.min((product.stockQuantity / 100) * 100, 100) : 0;
                            return (
                                <Link key={product.productId} className="product-card reveal-item" to={`/products/${product.productId}`} style={{ textDecoration: 'none' }}>
                                    <div className="product-card__image-wrapper">
                                        <span className="product-card__badge">{product.productType}</span>
                                        {product.primaryImage ? (
                                            <img className="product-card__image" alt={product.name} src={product.primaryImage} />
                                        ) : (
                                            <div className="product-card__image product-card__image--placeholder">
                                                <span className="material-symbols-outlined">image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-card__content">
                                        <h3 className="product-card__title">{product.name}</h3>
                                        <p className="product-card__sku">SKU: {product.sku}</p>
                                        <div className="product-card__pricing">
                                            <div className="product-card__price-wrapper">
                                                <div className="product-card__price">{formatPrice(product.price)}</div>
                                            </div>
                                            <button className="product-card__add-btn" title="Add to Cart" onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!user) { navigate('/login', { state: { message: 'Please log in to add items to cart' } }); return; }
                                                const ok = await addToCart(product.productId, 1);
                                                if (ok) toast.success(`${product.name} added to cart!`);
                                                else toast.error('Failed to add to cart');
                                            }}>
                                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="product-card__stock">
                                        <div className="product-card__stock-bar" style={{ width: `${stockPercent}%` }} />
                                    </div>
                                    <p className="product-card__stock-text">{product.stockQuantity} left in stock</p>
                                </Link>
                            );
                        }) : (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="product-card product-card--skeleton">
                                    <div className="skeleton-box" style={{ width: '100%', height: '10rem', borderRadius: '0.375rem' }} />
                                    <div className="skeleton-box" style={{ width: '80%', height: '1rem', marginTop: '0.5rem' }} />
                                    <div className="skeleton-box" style={{ width: '40%', height: '0.75rem', marginTop: '0.25rem' }} />
                                    <div className="skeleton-box" style={{ width: '50%', height: '1.25rem', marginTop: '0.5rem' }} />
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* ===== 7. BEST SELLERS (FROM API) ===== */}
                <section>
                    <div className="section-header">
                        <h2 className="section-header__title">
                            <span className="material-symbols-outlined">trending_up</span>
                            Best Sellers
                        </h2>
                        <Link to="/products" className="section-header__link">View All</Link>
                    </div>
                    <div className="bestsellers-grid">
                        {bestSellers.length > 0 ? bestSellers.map((p) => (
                            <Link key={p.productId} className="bestseller-card reveal-item" to={`/products/${p.productId}`} style={{ textDecoration: 'none' }}>
                                <div className="bestseller-card__img">
                                    {p.primaryImage ? (
                                        <img src={p.primaryImage} alt={p.name} />
                                    ) : (
                                        <div className="bestseller-card__placeholder">
                                            <span className="material-symbols-outlined">image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="bestseller-card__info">
                                    <h3>{p.name}</h3>
                                    <div className="bestseller-card__rating">
                                        {'★'.repeat(4)}{'☆'.repeat(1)}
                                        <span>({p.brand.name})</span>
                                    </div>
                                    <div className="bestseller-card__bottom">
                                        <span className="bestseller-card__price">{formatPrice(p.price)}</span>
                                        <span className={`bestseller-card__stock-badge ${p.inStock ? '' : 'out-of-stock'}`}>
                                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bestseller-card bestseller-card--skeleton">
                                    <div className="skeleton-box" style={{ width: '100%', aspectRatio: '1' }} />
                                    <div style={{ padding: '1rem' }}>
                                        <div className="skeleton-box" style={{ width: '80%', height: '1rem' }} />
                                        <div className="skeleton-box" style={{ width: '40%', height: '0.75rem', marginTop: '0.5rem' }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* ===== 8. NEW ARRIVALS (FROM API) ===== */}
                <section>
                    <div className="section-header">
                        <h2 className="section-header__title">New Arrivals</h2>
                        <div className="section-header__controls">
                            <button className="section-header__control-btn" onClick={() => scrollArrivals(-1)}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="section-header__control-btn" onClick={() => scrollArrivals(1)}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div className="new-arrivals-scroll" ref={arrivalsRef}>
                        {newArrivals.length > 0 ? newArrivals.map((product) => (
                            <article key={product.productId} className="arrival-card">
                                <div className="arrival-card__image">
                                    {product.primaryImage ? (
                                        <img src={product.primaryImage} alt={product.name} />
                                    ) : (
                                        <div className="arrival-card__placeholder">
                                            <span className="material-symbols-outlined">image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="arrival-card__content">
                                    <div>
                                        <div className="arrival-card__header">
                                            <h3 className="arrival-card__title">{product.name}</h3>
                                            <span className="arrival-card__badge">{product.productType}</span>
                                        </div>
                                        <p className="arrival-card__description">
                                            {product.brand.name} • {product.categories.map(c => c.name).join(', ')}
                                        </p>
                                    </div>
                                    <div className="arrival-card__footer">
                                        <span className="arrival-card__price">{formatPrice(product.price)}</span>
                                        <Link to={`/products/${product.productId}`} className="arrival-card__link">View Product</Link>
                                    </div>
                                </div>
                            </article>
                        )) : (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="arrival-card arrival-card--skeleton" style={{ minWidth: 320 }}>
                                    <div className="skeleton-box" style={{ width: '6rem', height: '6rem', borderRadius: '0.375rem' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton-box" style={{ width: '80%', height: '1rem' }} />
                                        <div className="skeleton-box" style={{ width: '60%', height: '0.75rem', marginTop: '0.25rem' }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* ===== 9. MARKET STATS ===== */}
                <section className="stats-section" ref={statsRef}>
                    <div className="stats-section__bg" />
                    <div className="stats-section__content">
                        <h2 className="stats-section__title">Trusted by Makers Worldwide</h2>
                        <p className="stats-section__subtitle">Join thousands of engineers, students, and hobbyists who trust STEM Gear</p>
                        <div className="stats-grid">
                            {[
                                { icon: 'inventory_2', value: totalProducts || 50, suffix: '+', label: 'Products Available' },
                                { icon: 'storefront', value: totalBrands || 10, suffix: '+', label: 'Trusted Brands' },
                                { icon: 'category', value: categories.length || 10, suffix: '+', label: 'Categories' },
                                { icon: 'star', value: 4.8, suffix: '★', label: 'Average Rating' },
                            ].map((stat, i) => (
                                <div key={i} className="stat-item">
                                    <span className="material-symbols-outlined stat-item__icon">{stat.icon}</span>
                                    <div className="stat-item__number">
                                        <CountUp target={stat.value} suffix={stat.suffix} animate={statsVisible} />
                                    </div>
                                    <span className="stat-item__label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== 10. TESTIMONIALS ===== */}
                <section className="testimonials-section">
                    <h2 className="testimonials-section__title">What Our Makers Say</h2>
                    <div className="testimonials-carousel">
                        {testimonials.map((t, i) => (
                            <div key={i} className={`testimonial-card ${i === activeTestimonial ? 'active' : ''}`}>
                                <div className="testimonial-card__stars">{'★'.repeat(t.rating)}</div>
                                <p className="testimonial-card__quote">"{t.quote}"</p>
                                <div className="testimonial-card__author">
                                    <div className="testimonial-card__avatar">{t.name.charAt(0)}</div>
                                    <div>
                                        <strong>{t.name}</strong>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="testimonials-dots">
                        {testimonials.map((_, i) => (
                            <button key={i} className={`dot ${i === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)} />
                        ))}
                    </div>
                </section>
            </main>
            <Footer />

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .success-toast {
                    position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000;
                    padding: 16px 24px; background: #16A34A; color: white; border-radius: 8px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: flex; align-items: center;
                    gap: 10px; font-size: 14px; font-weight: 500; animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

// ===== CountUp Component =====
const CountUp = ({ target, suffix, animate }: { target: number; suffix: string; animate: boolean }) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!animate) return;
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { start = target; clearInterval(timer); }
            setValue(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [animate, target]);
    return <>{value.toLocaleString()}{suffix}</>;
};

// ===== STATIC DATA (sections that don't need API) =====
const whyStemGear = [
    { icon: 'verified', title: 'Industrial-Grade Quality', description: 'Components from top manufacturers, rigorously tested for reliability and performance.' },
    { icon: 'local_shipping', title: 'Fast Shipping', description: 'Same-day dispatch for orders placed before 2PM. Free shipping on orders over $50.' },
    { icon: 'shield', title: 'Warranty Included', description: 'All products backed by manufacturer warranty. Easy returns within 30 days.' },
    { icon: 'support_agent', title: '24/7 Expert Support', description: 'Technical support from real engineers. Chat, email, or phone — we\'re here to help.' },
];

const howItWorks = [
    { icon: 'search', title: 'Browse', description: 'Explore 500+ components across 50+ categories' },
    { icon: 'shopping_cart', title: 'Order', description: 'Secure checkout with multiple payment options' },
    { icon: 'rocket_launch', title: 'Build', description: 'Fast shipping — start building within days' },
];



const testimonials = [
    { name: 'Alex Nguyen', role: 'IoT Engineer', rating: 5, quote: 'STEM Gear has become my go-to supplier. The quality is consistent and shipping is blazing fast. Highly recommended!' },
    { name: 'Sarah Chen', role: 'Maker & Educator', rating: 5, quote: 'As a STEM educator, I need reliable components for my students. STEM Gear never disappoints — great prices and excellent support.' },
    { name: 'David Park', role: 'Robotics Student', rating: 5, quote: 'The component selection is amazing. I built my entire senior project robot using parts from STEM Gear. 10/10!' },
];

export default HomePage;
