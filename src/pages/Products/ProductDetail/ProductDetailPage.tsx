import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import {
    ImageGallery,
    ProductInfo,
    AddToCartButton,
    ReviewSummary,
    ReviewList,
    ReviewForm,
    BundleComponents,
} from '@/components/product';
import {
    useProductDetail,
    useProductReviews,
    useProductBundle,
    useCreateReview,
} from '@/hooks/useProductDetail';
import { useAddToCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import type { ReviewFilterParams } from '@/types/product.types';
import './ProductDetailPage.css';

type TabType = 'description' | 'reviews' | 'bundle';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const productId = id ? parseInt(id, 10) : null;

    // Active tab state
    const [activeTab, setActiveTab] = useState<TabType>('description');

    // Review pagination state
    const [reviewParams, setReviewParams] = useState<ReviewFilterParams>({
        pageNumber: 1,
        pageSize: 10,
    });

    // Fetch product detail
    const {
        product,
        loading: productLoading,
        error: productError,
    } = useProductDetail(productId);

    // Fetch reviews (lazy load when tab is active)
    const [shouldLoadReviews, setShouldLoadReviews] = useState(false);
    const {
        reviews,
        pagination: reviewPagination,
        loading: reviewsLoading,
        refetch: refetchReviews,
    } = useProductReviews(shouldLoadReviews ? productId : null, reviewParams);

    // Fetch bundle (only for KIT products)
    const {
        bundle,
        loading: bundleLoading,
    } = useProductBundle(productId, product?.productType === 'KIT');

    // Create review hook
    const { createReview, loading: createReviewLoading } = useCreateReview(productId);

    // Add to cart hook
    const { addToCart, loading: addToCartLoading } = useAddToCart();

    // Load reviews when switching to reviews tab
    useEffect(() => {
        if (activeTab === 'reviews' && !shouldLoadReviews) {
            setShouldLoadReviews(true);
        }
    }, [activeTab, shouldLoadReviews]);

    // Handlers
    const triggerFlyToCart = () => {
        const img = document.querySelector('.main-image') as HTMLImageElement;
        const cartIcon = document.querySelector('.header__action-btn[title="Cart"]') as HTMLElement;

        if (!img || !cartIcon) return;

        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const clone = img.cloneNode(true) as HTMLImageElement;
        clone.style.position = 'fixed';
        clone.style.top = `${imgRect.top}px`;
        clone.style.left = `${imgRect.left}px`;
        clone.style.width = `${imgRect.width}px`;
        clone.style.height = `${imgRect.height}px`;
        clone.style.objectFit = 'cover';
        clone.style.borderRadius = '50%';
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        clone.style.pointerEvents = 'none';

        document.body.appendChild(clone);

        // Force reflow
        void clone.offsetWidth;

        clone.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;
        clone.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`;
        clone.style.width = '30px';
        clone.style.height = '30px';
        clone.style.opacity = '0.5';

        setTimeout(() => {
            clone.remove();
            cartIcon.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            cartIcon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 200);
        }, 800);
    };

    const handleAddToCart = async (quantity: number): Promise<boolean> => {
        if (!productId) return false;
        const success = await addToCart(productId, quantity);
        if (success) {
            triggerFlyToCart();
        }
        return success;
    };

    const handleLoginClick = () => {
        navigate('/login', { state: { from: `/products/${productId}` } });
    };

    const handleReviewPageChange = (page: number) => {
        setReviewParams((prev) => ({ ...prev, pageNumber: page }));
    };

    const handleReviewSubmit = async (review: { rating: number; comment: string }): Promise<boolean> => {
        const result = await createReview(review);
        if (result) {
            refetchReviews();
            return true;
        }
        return false;
    };

    const handleBundleComponentClick = (componentProductId: number) => {
        navigate(`/products/${componentProductId}`);
    };

    // Loading state
    if (productLoading) {
        return (
            <>
                <Header />
                <main className="product-detail-page">
                    <div className="container">
                        <div className="breadcrumb">
                            <div className="skeleton-box" style={{ width: '200px', height: '1rem' }} />
                        </div>
                        <section className="product-section">
                            <div className="product-grid">
                                <div className="product-images">
                                    <div className="skeleton-box" style={{ width: '100%', height: '400px', borderRadius: '12px' }} />
                                </div>
                                <div className="product-details">
                                    <div className="skeleton-box" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
                                    <div className="skeleton-box" style={{ width: '85%', height: '2rem', marginTop: '0.5rem' }} />
                                    <div className="skeleton-box" style={{ width: '40%', height: '1rem', marginTop: '0.5rem' }} />
                                    <div className="skeleton-box" style={{ width: '30%', height: '2rem', marginTop: '1rem' }} />
                                    <div className="skeleton-box" style={{ width: '50%', height: '1rem', marginTop: '0.5rem' }} />
                                    <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '8px', marginTop: '1.5rem' }} />
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Error state
    if (productError || !product) {
        return (
            <>
                <Header />
                <main className="product-detail-page">
                    <div className="container">
                        <div className="error-container">
                            <h2>Product Not Found</h2>
                            <p>{productError || 'The product you are looking for does not exist.'}</p>
                            <button className="back-btn" onClick={() => navigate('/products')}>
                                Back to Products
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Determine available tabs
    const tabs: { key: TabType; label: string }[] = [
        { key: 'description', label: 'Description' },
        { key: 'reviews', label: `Reviews (${reviews?.summary?.totalReviews ?? product.totalReviews ?? 0})` },
    ];
    if (product.productType === 'KIT') {
        tabs.splice(1, 0, { key: 'bundle', label: 'Kit Contents' });
    }

    return (
        <>
            <Header />
            <main className="product-detail-page">
                <div className="container">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                        <Link to="/products">Products</Link>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                        <span className="current">{product.name}</span>
                    </nav>

                    {/* Product Section */}
                    <section className="product-section">
                        <div className="product-grid">
                            {/* Left: Image Gallery */}
                            <div className="product-images">
                                <ImageGallery
                                    images={product.images ?? []}
                                    productName={product.name}
                                />
                            </div>

                            {/* Right: Product Info */}
                            <div className="product-details">
                                <ProductInfo product={product} />

                                {/* Warranty Info */}
                                {product.warrantyPolicy && (
                                    <div className="warranty-info">
                                        <div className="warranty-icon">🛡️</div>
                                        <div className="warranty-content">
                                            <span className="warranty-title">{product.warrantyPolicy.name}</span>
                                            <span className="warranty-duration">
                                                {product.warrantyPolicy.durationMonths} months warranty
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Add to Cart */}
                                <AddToCartButton
                                    inStock={product.inStock ?? (product.stockQuantity > 0)}
                                    stockQuantity={product.stockQuantity ?? 0}
                                    isAuthenticated={isAuthenticated}
                                    onAddToCart={handleAddToCart}
                                    onLoginClick={handleLoginClick}
                                    loading={addToCartLoading}
                                />

                                {/* Trust Badges */}
                                <div className="trust-badges">
                                    <div className="trust-badge">
                                        <span className="material-symbols-outlined">local_shipping</span>
                                        <span>Free shipping over $50</span>
                                    </div>
                                    <div className="trust-badge">
                                        <span className="material-symbols-outlined">undo</span>
                                        <span>30-day returns</span>
                                    </div>
                                    <div className="trust-badge">
                                        <span className="material-symbols-outlined">lock</span>
                                        <span>Secure payment</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tabs Section */}
                    <section className="tabs-section">
                        <div className="tabs-header">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="tabs-content">
                            {/* Description Tab */}
                            {activeTab === 'description' && (
                                <div className="tab-panel description-panel">
                                    {product.description ? (
                                        <div className="description-content">
                                            {product.description}
                                        </div>
                                    ) : (
                                        <p className="no-description">No description available.</p>
                                    )}
                                </div>
                            )}

                            {/* Bundle Tab (KIT only) */}
                            {activeTab === 'bundle' && product.productType === 'KIT' && (
                                <div className="tab-panel bundle-panel">
                                    {bundle ? (
                                        <BundleComponents
                                            bundle={bundle}
                                            loading={bundleLoading}
                                            onComponentClick={handleBundleComponentClick}
                                        />
                                    ) : bundleLoading ? (
                                        <div className="loading-container">
                                            <div className="loading-spinner" />
                                            <p>Loading kit contents...</p>
                                        </div>
                                    ) : (
                                        <p>No bundle information available.</p>
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="tab-panel reviews-panel">
                                    {/* Review Summary */}
                                    {reviews?.summary && (
                                        <ReviewSummary summary={reviews.summary} />
                                    )}

                                    {/* Write Review Form */}
                                    <div className="review-form-section">
                                        <ReviewForm
                                            onSubmit={handleReviewSubmit}
                                            isAuthenticated={isAuthenticated}
                                            loading={createReviewLoading}
                                            onLoginClick={handleLoginClick}
                                        />
                                    </div>

                                    {/* Reviews List */}
                                    <div className="reviews-list-section">
                                        <h3 className="section-title">Customer Reviews</h3>
                                        <ReviewList
                                            reviews={reviews?.reviews.items || []}
                                            pagination={reviewPagination}
                                            loading={reviewsLoading}
                                            onPageChange={handleReviewPageChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ProductDetailPage;
