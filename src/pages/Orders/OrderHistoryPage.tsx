import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import OrderCard from '../../components/order/OrderCard';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import type { OrderStatus } from '../../types/order.types';
import './OrderPages.css';

const statusFilters: { value: string; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Processing' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'SHIPPED', label: 'Shipping' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Canceled' },
];

const OrderHistoryPage = () => {
    const [searchInput, setSearchInput] = useState('');
    const { orders, totalPages, totalCount: _totalCount, currentPage, isLoading, error, filter, setFilter } = useOrders();

    const handleSearch = () => {
        setFilter({ searchTerm: searchInput || undefined, pageNumber: 1 });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <>
            <Header />
            <div className="order-page-wrapper">
                {/* Page Header */}
                <div className="order-page-header">
                    <h1 className="order-page-title">Order History</h1>
                    <p className="order-page-subtitle">
                        Track and manage your industrial components and STEM equipment.
                    </p>
                </div>

                {/* Search */}
                <div className="order-search-wrapper">
                    <span className="order-search-icon">
                        <span className="material-symbols-outlined">search</span>
                    </span>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search by Order ID or product name..."
                        className="order-search-input"
                    />
                </div>

                {/* Filter Chips */}
                <div className="order-filter-chips">
                    {statusFilters.map((sf) => (
                        <button
                            key={sf.value}
                            onClick={() => setFilter({ status: (sf.value as OrderStatus) || undefined, pageNumber: 1 })}
                            className={`order-chip ${(filter.status || '') === sf.value ? 'order-chip--active' : ''}`}
                        >
                            {sf.label}
                        </button>
                    ))}
                </div>

                {/* Order List */}
                <div className="order-cards-list">
                    {isLoading ? (
                        <div className="order-cards-list">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="order-card order-card--skeleton">
                                    <div className="order-card__body">
                                        <div className="order-card__header">
                                            <div>
                                                <div className="skeleton-box" style={{ width: '120px', height: '1rem', marginBottom: '0.5rem' }} />
                                                <div className="skeleton-box" style={{ width: '90px', height: '0.7rem' }} />
                                            </div>
                                            <div className="skeleton-box" style={{ width: '80px', height: '1.5rem', borderRadius: '9999px' }} />
                                        </div>
                                        <div className="order-card__content">
                                            <div className="skeleton-box" style={{ width: '96px', height: '96px', borderRadius: '0.5rem', flexShrink: 0 }} />
                                            <div className="order-card__info">
                                                <div className="skeleton-box" style={{ width: '70%', height: '0.9rem', marginBottom: '0.5rem' }} />
                                                <div className="skeleton-box" style={{ width: '40%', height: '0.7rem' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="order-card__footer">
                                        <div className="skeleton-box" style={{ width: '100px', height: '1.1rem' }} />
                                        <div className="skeleton-box" style={{ width: '80px', height: '2rem', borderRadius: '0.5rem' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="order-empty-state">
                            <p style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="order-empty-state">
                            <div className="order-empty-icon">
                                <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <h3 className="order-empty-title">No orders yet</h3>
                            <p className="order-empty-text">Start shopping to see your order history here.</p>
                            <Link to="/products" className="order-empty-cta">
                                <span className="material-symbols-outlined">storefront</span>
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <OrderCard key={order.orderId} order={order} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="order-pagination">
                        <button
                            onClick={() => setFilter({ pageNumber: currentPage - 1 })}
                            disabled={currentPage <= 1}
                            className="order-page-btn"
                        >
                            ← Previous
                        </button>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setFilter({ pageNumber: page })}
                                    className={`order-page-num ${page === currentPage ? 'order-page-num-active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setFilter({ pageNumber: currentPage + 1 })}
                            disabled={currentPage >= totalPages}
                            className="order-page-btn"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default OrderHistoryPage;
