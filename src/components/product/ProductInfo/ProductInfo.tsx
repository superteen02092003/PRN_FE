import type { ProductDetailDto } from '@/types/product.types';
import './ProductInfo.css';

interface ProductInfoProps {
    product: ProductDetailDto;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
    const {
        name,
        sku,
        price,
        stockQuantity = 0,
        productType,
        brand,
        categories = [],
        averageRating = 0,
        totalReviews = 0,
    } = product;

    // Compute inStock from stockQuantity if API doesn't return inStock field
    const inStock = product.inStock ?? stockQuantity > 0;

    return (
        <div className="product-info">
            {/* Product Type Badge */}
            {productType && (
                <div className="product-type-badge" data-type={productType.toLowerCase()}>
                    {productType}
                </div>
            )}

            {/* Product Name */}
            <h1 className="product-name">{name}</h1>

            {/* Rating & Reviews */}
            <div className="rating-section">
                <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <span className="rating-value">{averageRating.toFixed(1)}</span>
                <span className="review-count">({totalReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="price-section">
                <span className="price">{formatPrice(price)}</span>
            </div>

            {/* Stock Status */}
            <div className={`stock-status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                {inStock ? (
                    <>
                        <span className="status-icon">✓</span>
                        <span>In Stock ({stockQuantity} available)</span>
                    </>
                ) : (
                    <>
                        <span className="status-icon">✕</span>
                        <span>Out of Stock</span>
                    </>
                )}
            </div>

            {/* Product Details */}
            <div className="product-details">
                <div className="detail-row">
                    <span className="detail-label">SKU:</span>
                    <span className="detail-value">{sku}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Brand:</span>
                    <span className="detail-value">{brand?.name || 'Unknown'}</span>
                </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div className="categories-section">
                    <span className="categories-label">Categories:</span>
                    <div className="category-tags">
                        {categories.map((category) => (
                            <span key={category.categoryId} className="category-tag">
                                {category.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductInfo;
