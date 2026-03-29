import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '@/utils/imageUrl';
import { toast } from 'react-toastify';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import { useProducts, useCategories, useBrands } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import type { ProductFilterParams, ProductType } from '../../types/product.types';
import './ProductsPage.css';

// Debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

// Format price to VND
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart, error: addToCartError } = useAddToCart();
    const [addingProductId, setAddingProductId] = useState<number | null>(null);

    // UI State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filter State (from URL or defaults)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
    );
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(
        searchParams.get('brandId') ? Number(searchParams.get('brandId')) : null
    );
    const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(() => {
        const typeParam = searchParams.get('productType');
        if (typeParam === 'MODULE' || typeParam === 'KIT' || typeParam === 'COMPONENT') {
            return typeParam;
        }
        return null;
    });
    const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    );
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [pageNumber, setPageNumber] = useState(
        searchParams.get('page') ? Number(searchParams.get('page')) : 1
    );
    const pageSize = 12;

    // Debounced search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Build filter params for API
    const filterParams: ProductFilterParams = useMemo(() => {
        const params: ProductFilterParams = {
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
        };

        if (debouncedSearchTerm) params.searchTerm = debouncedSearchTerm;
        if (selectedCategoryId) params.categoryId = selectedCategoryId;
        if (selectedBrandId) params.brandId = selectedBrandId;
        if (selectedProductType) params.productType = selectedProductType as ProductType;
        if (minPrice) params.minPrice = Number(minPrice);
        if (maxPrice) params.maxPrice = Number(maxPrice);

        return params;
    }, [debouncedSearchTerm, selectedCategoryId, selectedBrandId, selectedProductType, minPrice, maxPrice, pageNumber, pageSize, sortBy, sortOrder]);

    // Fetch data using hooks
    const { products: fetchedProducts, pagination, loading: productsLoading, error: productsError } = useProducts(filterParams);
    const { categories, loading: categoriesLoading } = useCategories();
    const { brands, loading: brandsLoading } = useBrands();

    // Client-side sorting (temporary until backend supports sorting)
    const products = useMemo(() => {
        if (!fetchedProducts || fetchedProducts.length === 0) return fetchedProducts;

        const sorted = [...fetchedProducts];
        
        switch (sortBy) {
            case 'price':
                sorted.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
                break;
            case 'name':
                sorted.sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name);
                    return sortOrder === 'asc' ? comparison : -comparison;
                });
                break;
            case 'createdAt':
            default:
                // Products already sorted by createdAt from backend
                if (sortOrder === 'asc') {
                    sorted.reverse();
                }
                break;
        }

        return sorted;
    }, [fetchedProducts, sortBy, sortOrder]);

    // Handle add to cart
    const handleAddToCart = useCallback(async (e: React.MouseEvent, productId: number, productName: string) => {
        e.preventDefault(); // Prevent navigation to product detail
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please login to add items to cart');
            navigate('/login', { state: { from: '/products' } });
            return;
        }

        setAddingProductId(productId);
        const success = await addToCart(productId, 1);
        setAddingProductId(null);

        if (success) {
            toast.success(`${productName} added to cart!`);
        }
        // Note: Error will be in addToCartError after this
    }, [isAuthenticated, navigate, addToCart]);

    // Show error toast when add to cart fails
    useEffect(() => {
        if (addToCartError) {
            toast.error(addToCartError);
        }
    }, [addToCartError]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();

        if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
        if (selectedCategoryId) params.set('categoryId', String(selectedCategoryId));
        if (selectedBrandId) params.set('brandId', String(selectedBrandId));
        if (selectedProductType) params.set('productType', selectedProductType);
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (pageNumber > 1) params.set('page', String(pageNumber));

        setSearchParams(params, { replace: true });
    }, [debouncedSearchTerm, selectedCategoryId, selectedBrandId, selectedProductType, sortBy, sortOrder, minPrice, maxPrice, pageNumber, setSearchParams]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPageNumber(1);
    }, [debouncedSearchTerm, selectedCategoryId, selectedBrandId, selectedProductType, sortBy, sortOrder, minPrice, maxPrice]);

    // Handlers
    const handleCategoryChange = useCallback((categoryId: number) => {
        setSelectedCategoryId(prev => prev === categoryId ? null : categoryId);
    }, []);

    const handleBrandChange = useCallback((brandId: number) => {
        setSelectedBrandId(prev => prev === brandId ? null : brandId);
    }, []);

    const handlePriceFilter = useCallback(() => {
        // Price filter is applied immediately through state
        setPageNumber(1);
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedCategoryId(null);
        setSelectedBrandId(null);
        setSelectedProductType(null);
        setMinPrice('');
        setMaxPrice('');
        setPageNumber(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setPageNumber(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Active filters for display
    const activeFilters = useMemo(() => {
        const filters: { label: string; onRemove: () => void }[] = [];

        if (debouncedSearchTerm) {
            filters.push({
                label: `Search: "${debouncedSearchTerm}"`,
                onRemove: () => setSearchTerm(''),
            });
        }

        if (selectedCategoryId) {
            const category = categories.find(c => c.categoryId === selectedCategoryId);
            if (category) {
                filters.push({
                    label: `Category: ${category.name}`,
                    onRemove: () => setSelectedCategoryId(null),
                });
            }
        }

        if (selectedBrandId) {
            const brand = brands.find(b => b.brandId === selectedBrandId);
            if (brand) {
                filters.push({
                    label: `Brand: ${brand.name}`,
                    onRemove: () => setSelectedBrandId(null),
                });
            }
        }

        if (selectedProductType) {
            filters.push({
                label: `Type: ${selectedProductType}`,
                onRemove: () => setSelectedProductType(null),
            });
        }

        if (minPrice || maxPrice) {
            const priceLabel = minPrice && maxPrice
                ? `Price: ${formatPrice(Number(minPrice))} - ${formatPrice(Number(maxPrice))}`
                : minPrice
                    ? `Price: from ${formatPrice(Number(minPrice))}`
                    : `Price: up to ${formatPrice(Number(maxPrice))}`;
            filters.push({
                label: priceLabel,
                onRemove: () => {
                    setMinPrice('');
                    setMaxPrice('');
                },
            });
        }

        return filters;
    }, [debouncedSearchTerm, selectedCategoryId, selectedBrandId, selectedProductType, minPrice, maxPrice, categories, brands]);

    // Generate pagination pages
    const paginationPages = useMemo(() => {
        if (!pagination) return [];

        const { totalPages } = pagination;
        const pages: (number | 'dots')[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (pageNumber > 3) pages.push('dots');

            const start = Math.max(2, pageNumber - 1);
            const end = Math.min(totalPages - 1, pageNumber + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (pageNumber < totalPages - 2) pages.push('dots');

            pages.push(totalPages);
        }

        return pages;
    }, [pagination, pageNumber]);

    return (
        <div className="products-page">
            <Header />

            <main className="products-main">
                {/* Page Header */}
                <div className="page-header">
                    <div className="page-header__info">
                        <h1 className="page-header__title">Products</h1>
                        <p className="page-header__subtitle">
                            {pagination
                                ? `Showing ${products.length} of ${pagination.totalCount} products`
                                : 'Explore our wide range of STEM gear and electronics components.'}
                        </p>
                    </div>
                    <div className="page-header__actions">
                        {/* Sort Dropdown */}
                        <select 
                            className="sort-select"
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newSortOrder as 'asc' | 'desc');
                            }}
                            style={{
                                padding: '0.5rem 2rem 0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                marginRight: '1rem',
                                background: 'white'
                            }}
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>

                        <div className="view-toggle">
                            <button
                                className={`view-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button
                                className={`view-toggle__btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <span className="material-symbols-outlined">view_list</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="content-layout">
                    {/* Mobile Filter Button */}
                    <div className="mobile-filter-btn">
                        <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle-btn">
                            <span className="material-symbols-outlined">filter_list</span>
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {/* Sidebar Filters */}
                    <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className="active-filters">
                                {activeFilters.map((filter, index) => (
                                    <div key={index} className="active-filter-tag">
                                        {filter.label}
                                        <button onClick={filter.onRemove} className="remove-filter">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                ))}
                                <button onClick={handleClearFilters} className="clear-all-filters">
                                    Clear All
                                </button>
                            </div>
                        )}

                        {/* Search Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Search</h3>
                            <div className="search-input-wrapper">
                                <span className="material-symbols-outlined search-icon">search</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="search-clear"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Category</h3>
                            <div className="filter-group__options">
                                {categoriesLoading ? (
                                    <div className="filter-loading">Loading...</div>
                                ) : (
                                    categories.map(cat => (
                                        <label key={cat.categoryId} className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategoryId === cat.categoryId}
                                                onChange={() => handleCategoryChange(cat.categoryId)}
                                            />
                                            <span className="filter-option__label">{cat.name}</span>
                                            <span className="filter-option__count">{cat.productCount}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Brand</h3>
                            <div className="filter-group__options">
                                {brandsLoading ? (
                                    <div className="filter-loading">Loading...</div>
                                ) : (
                                    brands.map(brand => (
                                        <label key={brand.brandId} className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrandId === brand.brandId}
                                                onChange={() => handleBrandChange(brand.brandId)}
                                            />
                                            <span className="filter-option__label">{brand.name}</span>
                                            <span className="filter-option__count">{brand.productCount}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Product Type Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Product Type</h3>
                            <div className="filter-group__options">
                                {(['MODULE', 'KIT', 'COMPONENT'] as const).map(type => (
                                    <label key={type} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedProductType === type}
                                            onChange={() => setSelectedProductType(prev => prev === type ? null : type as ProductType)}
                                        />
                                        <span className="filter-option__label">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Price Range</h3>
                            <div className="price-filter">
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        className="price-input"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        min="0"
                                    />
                                    <span className="price-separator">-</span>
                                    <input
                                        type="number"
                                        className="price-input"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <button
                                    className="price-apply-btn"
                                    onClick={handlePriceFilter}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="products-section">
                        {/* Loading State — Skeleton Cards */}
                        {productsLoading && (
                            <div className="products-grid">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="product-card product-card--skeleton">
                                        <div className="skeleton-box" style={{ width: '100%', height: '200px', borderRadius: '8px 8px 0 0' }} />
                                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div className="skeleton-box" style={{ width: '40%', height: '0.7rem' }} />
                                            <div className="skeleton-box" style={{ width: '85%', height: '1rem' }} />
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                <div className="skeleton-box" style={{ width: '60px', height: '1.2rem', borderRadius: '4px' }} />
                                                <div className="skeleton-box" style={{ width: '60px', height: '1.2rem', borderRadius: '4px' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                <div className="skeleton-box" style={{ width: '35%', height: '1.1rem' }} />
                                                <div className="skeleton-box" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error State */}
                        {productsError && !productsLoading && (
                            <div className="products-error">
                                <span className="material-symbols-outlined">error</span>
                                <p>{productsError}</p>
                                <button onClick={() => window.location.reload()} className="retry-btn">
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!productsLoading && !productsError && products.length === 0 && (
                            <div className="products-empty">
                                <span className="material-symbols-outlined">inventory_2</span>
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search term</p>
                                {activeFilters.length > 0 && (
                                    <button onClick={handleClearFilters} className="clear-filters-btn">
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Products Grid */}
                        {!productsLoading && !productsError && products.length > 0 && (
                            <>
                                <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                                    {products.map(product => (
                                        <Link
                                            key={product.productId}
                                            to={`/products/${product.productId}`}
                                            className="product-card"
                                        >
                                            {/* Stock Badge */}
                                            <div className={`product-card__badge badge--${product.inStock ? 'green' : 'gray'}`}>
                                                {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                                            </div>

                                            {/* Image */}
                                            <div className="product-card__image">
                                                {product.primaryImage ? (
                                                    <img
                                                        className="product-card__image"
                                                        src={resolveImageUrl(product.primaryImage) || ''}
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            const img = e.target as HTMLImageElement;
                                                            img.style.display = 'none';
                                                            const parent = img.parentElement;
                                                            if (parent && !parent.querySelector('.image-placeholder')) {
                                                                parent.classList.add('no-image');
                                                                const placeholder = document.createElement('div');
                                                                placeholder.className = 'image-placeholder';
                                                                placeholder.innerHTML = '<span class="material-symbols-outlined">image_not_supported</span><span>Image Unavailable</span>';
                                                                parent.insertBefore(placeholder, parent.firstChild);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="image-placeholder">
                                                        <span className="material-symbols-outlined">image_not_supported</span>
                                                        <span>No Image Available</span>
                                                    </div>
                                                )}
                                                <span className="quick-view-btn">View Details</span>
                                            </div>

                                            {/* Content */}
                                            <div className="product-card__content">
                                                <div className="product-card__brand">{product.brand?.name || 'Unknown Brand'}</div>
                                                <h3 className="product-card__name">{product.name}</h3>

                                                {/* Categories & SKU */}
                                                <div className="product-card__specs">
                                                    {product.categories?.slice(0, 2).map((cat) => (
                                                        <span key={cat.categoryId} className="spec-tag">{cat.name}</span>
                                                    ))}
                                                    <span className="sku">SKU: {product.sku}</span>
                                                </div>

                                                {/* Price & Action */}
                                                <div className="product-card__footer">
                                                    <div className="price-info">
                                                        <span className="product-price">{formatPrice(product.price)}</span>
                                                        <span className="stock-qty">
                                                            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className={`cart-btn ${!product.inStock ? 'disabled' : ''}`}
                                                        onClick={(e) => handleAddToCart(e, product.productId, product.name)}
                                                        disabled={!product.inStock || addingProductId === product.productId}
                                                    >
                                                        {addingProductId === product.productId ? (
                                                            <div className="loading-spinner-small" />
                                                        ) : (
                                                            <span className="material-symbols-outlined">add_shopping_cart</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="pagination__btn"
                                            onClick={() => handlePageChange(pageNumber - 1)}
                                            disabled={pageNumber === 1}
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>

                                        {paginationPages.map((page, index) =>
                                            page === 'dots' ? (
                                                <span key={`dots-${index}`} className="pagination__dots">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    className={`pagination__btn ${pageNumber === page ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}

                                        <button
                                            className="pagination__btn"
                                            onClick={() => handlePageChange(pageNumber + 1)}
                                            disabled={pageNumber === pagination.totalPages}
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductsPage;
