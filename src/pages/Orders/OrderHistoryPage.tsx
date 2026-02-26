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
    const { orders, totalPages, totalCount, currentPage, isLoading, error, filter, setFilter } = useOrders();

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
                        <div className="order-loading">
                            <div className="order-loading-spinner" />
                            <p style={{ color: '#64748b' }}>Loading orders...</p>
                        </div>
                    ) : error ? (
                        <div className="order-empty-state">
                            <p style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="order-empty-state">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <p>You don't have any orders yet</p>
                            <Link to="/products">Start Shopping →</Link>
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
