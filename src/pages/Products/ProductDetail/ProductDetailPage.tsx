import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const handleAddToCart = async (quantity: number): Promise<boolean> => {
        if (!productId) return false;
        return await addToCart(productId, quantity);
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
                        <div className="loading-container">
                            <div className="loading-spinner" />
                            <p>Loading product...</p>
                        </div>
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
        { key: 'reviews', label: `Reviews (${product.totalReviews ?? 0})` },
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
                        <a href="/">Home</a>
                        <span>/</span>
                        <a href="/products">Products</a>
                        <span>/</span>
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
