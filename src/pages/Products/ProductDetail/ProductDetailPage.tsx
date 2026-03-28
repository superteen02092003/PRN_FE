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

type TabType = 'description' | 'reviews' | 'bundle' | 'specifications' | 'documents';

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
        { key: 'description', label: 'Mô tả' },
    ];
    if (product.productType === 'KIT') {
        tabs.push({ key: 'bundle', label: 'Bộ kit bao gồm' });
    }
    if (product.specifications && product.specifications.length > 0) {
        tabs.push({ key: 'specifications', label: 'Thông số kỹ thuật' });
    }
    if (product.documents && product.documents.length > 0) {
        tabs.push({ key: 'documents', label: 'Tài liệu' });
    }
    tabs.push({ key: 'reviews', label: `Đánh giá (${reviews?.summary?.totalReviews ?? product.totalReviews ?? 0})` });

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
                                        <span>Miễn phí ship đơn từ 500K</span>
                                    </div>
                                    <div className="trust-badge">
                                        <span className="material-symbols-outlined">undo</span>
                                        <span>Hỗ trợ trả/đổi hàng</span>
                                    </div>
                                    <div className="trust-badge">
                                        <span className="material-symbols-outlined">lock</span>
                                        <span>Thanh toán bảo mật</span>
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
                                        <p className="no-description">Chưa có mô tả sản phẩm.</p>
                                    )}
                                    {product.compatibilityInfo && (
                                        <div className="compatibility-info">
                                            <h4 className="compatibility-title">
                                                <span className="material-symbols-outlined">cable</span>
                                                Tương thích với
                                            </h4>
                                            <p className="compatibility-text">{product.compatibilityInfo}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Specifications Tab */}
                            {activeTab === 'specifications' && (
                                <div className="tab-panel specs-panel">
                                    <h3 className="specs-title">Thông số kỹ thuật</h3>
                                    <table className="specs-table">
                                        <tbody>
                                            {product.specifications?.map((spec) => (
                                                <tr key={spec.specificationId}>
                                                    <td className="spec-name">{spec.specName}</td>
                                                    <td className="spec-value">{spec.specValue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div className="tab-panel docs-panel">
                                    <h3 className="docs-title">Tài liệu & Hướng dẫn</h3>
                                    {(['DATASHEET', 'TUTORIAL', 'PINOUT', 'CODE_EXAMPLE', 'OTHER'] as const).map((type) => {
                                        const docsOfType = product.documents?.filter((d) => d.documentType === type) ?? [];
                                        if (docsOfType.length === 0) return null;
                                        const typeLabel: Record<string, string> = {
                                            DATASHEET: 'Datasheet',
                                            TUTORIAL: 'Hướng dẫn',
                                            PINOUT: 'Pinout Diagram',
                                            CODE_EXAMPLE: 'Code Mẫu',
                                            OTHER: 'Khác',
                                        };
                                        const typeIcon: Record<string, string> = {
                                            DATASHEET: 'description',
                                            TUTORIAL: 'school',
                                            PINOUT: 'account_tree',
                                            CODE_EXAMPLE: 'code',
                                            OTHER: 'attach_file',
                                        };
                                        return (
                                            <div key={type} className="doc-group">
                                                <h4 className="doc-group-title">
                                                    <span className="material-symbols-outlined">{typeIcon[type]}</span>
                                                    {typeLabel[type]}
                                                </h4>
                                                <ul className="doc-list">
                                                    {docsOfType.map((doc) => (
                                                        <li key={doc.documentId}>
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                                <span className="material-symbols-outlined">open_in_new</span>
                                                                {doc.title}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
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

                    {/* Related Products Section */}
                    {product.relatedProducts && product.relatedProducts.length > 0 && (
                        <section className="related-products-section">
                            <h2 className="related-title">Sản phẩm liên quan</h2>
                            <div className="related-scroll">
                                {product.relatedProducts.map((related) => (
                                    <div
                                        key={related.relatedProductId}
                                        className="related-card"
                                        onClick={() => navigate(`/products/${related.productId}`)}
                                    >
                                        <div className="related-img-wrap">
                                            {related.primaryImage ? (
                                                <img src={related.primaryImage} alt={related.name} className="related-img" />
                                            ) : (
                                                <div className="related-img-placeholder">
                                                    <span className="material-symbols-outlined">image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="related-info">
                                            <span className={`relation-badge relation-badge--${related.relationType.toLowerCase()}`}>
                                                {related.relationType === 'ACCESSORY' ? 'Phụ kiện' : related.relationType === 'SIMILAR' ? 'Tương tự' : 'Gợi ý bộ kit'}
                                            </span>
                                            <p className="related-name">{related.name}</p>
                                            <p className="related-sku">{related.sku}</p>
                                            <p className="related-price">{related.price.toLocaleString('vi-VN')}₫</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ProductDetailPage;
