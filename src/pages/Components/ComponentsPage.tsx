import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import './ComponentsPage.css';

// Mock product data
const mockProducts = [
    {
        id: 1,
        name: 'Arduino Uno R3',
        brand: 'Arduino',
        price: 23.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeYn-nNzvZ0TAAw4bV7S4VQRf-a_GGIMzShyfn6F9LtcJ6OV2dJbyNBv9_8dlbG-XvuRVrf306gSXM9EDadDBfFxEIUtEuxGCTw93qrrY8i_dJb8ThTVoHwt10T5WkmphGRf3uCG0pWSIZfNI2SObqh_t2X4ftgkP_g7-1MkRq-OZsfU79Cm15tPSdGkiBkSK7NGVvgzZLIqmtV-TtBH4BGrVrHtxpeIkcz9LX7hO0kz5u368eX51OGpXSZWWEpmxx69QEMh27pZk',
        specs: ['5V Logic', 'DIP'],
        sku: 'A000066',
        badge: 'IN STOCK',
        badgeColor: 'green'
    },
    {
        id: 2,
        name: 'ESP32-WROOM-32',
        brand: 'Espressif',
        price: 5.50,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbyIAa-xUdjXiOWaE2RJ-TkXBhL1-AkHlurO9KOjGFLxU6ey6fr7Ljf3QrOV9WwC2u8ciVrmTx00peURfRVxUtHy_ShLASRaQUVo-B50J8CwA9hWmFEZZtusbrKOKf8YJ-Xb_Fbe4wIu32rcWTgLfQa-7UPJw0n_9gaPXHMvZXTZo8756NpAHoFBUXu3jsZ71tEuAuhDfEJVoUwWVGvDpWLNrfy-CFuYYj3G6iRGKbX6xuWjfmO4GapQ1HRQvG5PX7mSWGIZ45is',
        specs: ['3.3V Logic', 'SMD'],
        sku: 'ESP-32',
        badge: 'BEST SELLER',
        badgeColor: 'orange',
        volumePricing: true
    },
    {
        id: 3,
        name: 'Raspberry Pi Pico',
        brand: 'Raspberry Pi',
        price: 4.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBAzyq_DCjRqJggDJXXLs6mmnVkjAogL53InOOFP-F-00fyIjP1MluvWxD-IuSDWLBVi3gP8HUwzep7HbKiXeAbf1nCv6ARTRbJCH9_6b9LGUAS175wA9bC39igZT1qbngeRYh1nTrveJejBGSyf5RspditEdorLuw46AT6_wCU4I0LOGT2VQpEAAWHHJfcHTCcTIXtWhgTX2i8yKjQaAuoLObFRnInkspGalTM-6KsGFdZHDhGQHR-8kucoD6k1XHZJGgVyAo9iI',
        specs: ['3.3V Logic', 'SMD/TH'],
        sku: 'SC0915',
        badge: 'LOW STOCK',
        badgeColor: 'gray'
    },
    {
        id: 4,
        name: 'Nucleo-64 STM32F401',
        brand: 'STMicroelectronics',
        price: 14.50,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjnbgkMHFKoWAh5pLRUOL4Ra01yen6_8dbXQeyf-PTeuhlxEvUM7s56PND7rHTk0WEoqPuX_gmi7lbgJKL3OkRZo8MNNOcIeaHP_3CKk6oCiYFBQiILpjKbhIZP-rmYyiEEcWb_Im3NcHPFSL4-gcLBfiIqaORYY2OTSiBpwpkIpMTNdXN1icFbonJb897pk4Qp03YFep5ECucZhHjwky0g0NpVW_YrA_8VKenzruItJ2BMlGH9I0utb0VaBFWuQ_WU7L0lDmqS4w',
        specs: ['3.3V Logic', 'Dev Board'],
        sku: 'NUC-F401RE'
    },
    {
        id: 5,
        name: 'ATmega328P-PU',
        brand: 'Microchip',
        price: 2.95,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIuE93cq5cxq_9QX7M4mwkHbIAe4vJal-GT7gY-LTmm6eH-mzAR58ZShehI6O6YjK3hYe33Q3028vbO7klcbhwBclG7Vb4krgRrLjaFJSht_cUc50LfgvVEx-Qdxc5x4Y3e8ZokPwTUKo_-AHAE-BlBtbPMyg1pl_uQb-cjdO-K-z_B84mZg9IEaC_oH-2KX8Zj6cqrKm8rZA47R_0vq8zjCC3vr93TvFEEmTgqf5h_O69YuJTWNE0MDCSRCPOyRduk-E4kPaLvhc',
        specs: ['5V Logic', 'DIP-28'],
        sku: 'ATM-328P'
    },
    {
        id: 6,
        name: 'Teensy 4.0',
        brand: 'PJRC',
        price: 21.95,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjXHz5zCPncBFV5iD_4z89faGHi2XuWr2xBpGKfUrvPnWfp9o4u8hh9Iaq1A2oU2IV9Xv2pqiZh6MwK5puQulYupQgmTqpOft6O7a0GuG_QBfl1iVxyf60zi-R8uSatRvZmH8yq5J7EPEKdOejXq6gibGcm3TBsMopRSSwO6TwCtirru2I7iHPzG1895YcFRcpCOqYoq_rZoKEs-ueY0PU1lrf_iw9Mx_wb57mQGve_oT67J_RUfVqH24MvZbuBRXsze2nNplba50',
        specs: ['3.3V Logic', '600MHz'],
        sku: 'TSY-40'
    }
];

const categories = [
    { name: 'Dev Boards', count: 124 },
    { name: 'ICs / Chips', count: 86 },
    { name: 'Accessories', count: 42 }
];

const brands = ['Arduino', 'Espressif', 'Raspberry Pi', 'Adafruit', 'SparkFun'];

const ComponentsPage = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Dev Boards']);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<string[]>(['In Stock']);

    const removeFilter = (filter: string) => {
        setActiveFilters(activeFilters.filter(f => f !== filter));
    };

    return (
        <div className="components-page">
            <Header />

            <main className="components-main">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/components" className="breadcrumb-link">Components</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">Microcontrollers</span>
                </div>

                {/* Page Header */}
                <div className="page-header">
                    <div className="page-header__info">
                        <h1 className="page-header__title">Microcontrollers & Processors</h1>
                        <p className="page-header__subtitle">Power your next project with our wide selection of dev boards and chips.</p>
                    </div>
                    <div className="page-header__actions">
                        <button className="sort-button">
                            <span className="material-symbols-outlined">sort</span>
                            Sort: Relevance
                        </button>
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
                                {activeFilters.map(filter => (
                                    <div key={filter} className="active-filter-tag">
                                        {filter}
                                        <button onClick={() => removeFilter(filter)} className="remove-filter">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Category Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Category</h3>
                            <div className="filter-group__options">
                                {categories.map(cat => (
                                    <label key={cat.name} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.name)}
                                            onChange={() => {
                                                if (selectedCategories.includes(cat.name)) {
                                                    setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                                } else {
                                                    setSelectedCategories([...selectedCategories, cat.name]);
                                                }
                                            }}
                                        />
                                        <span className="filter-option__label">{cat.name}</span>
                                        <span className="filter-option__count">{cat.count}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Logic Voltage Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Logic Voltage</h3>
                            <div className="filter-group__options">
                                <label className="filter-option">
                                    <input type="checkbox" />
                                    <span className="filter-option__label">3.3V Logic</span>
                                </label>
                                <label className="filter-option">
                                    <input type="checkbox" />
                                    <span className="filter-option__label">5V Logic</span>
                                </label>
                            </div>
                        </div>

                        {/* Mounting Type Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Mounting Type</h3>
                            <div className="filter-group__options">
                                <label className="filter-option">
                                    <input type="checkbox" />
                                    <span className="filter-option__label">SMD / SMT</span>
                                </label>
                                <label className="filter-option">
                                    <input type="checkbox" />
                                    <span className="filter-option__label">Through-Hole (DIP)</span>
                                </label>
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Brand</h3>
                            <div className="filter-group__options">
                                {brands.map(brand => (
                                    <label key={brand} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => {
                                                if (selectedBrands.includes(brand)) {
                                                    setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                                } else {
                                                    setSelectedBrands([...selectedBrands, brand]);
                                                }
                                            }}
                                        />
                                        <span className="filter-option__label">{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="products-section">
                        <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                            {mockProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    {/* Badge */}
                                    {product.badge && (
                                        <div className={`product-card__badge badge--${product.badgeColor}`}>
                                            {product.badge}
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div className="product-card__image">
                                        <img src={product.image} alt={product.name} />
                                        <button className="quick-view-btn">Quick View</button>
                                    </div>

                                    {/* Content */}
                                    <div className="product-card__content">
                                        <div className="product-card__brand">{product.brand}</div>
                                        <h3 className="product-card__name">{product.name}</h3>

                                        {/* Specs */}
                                        <div className="product-card__specs">
                                            {product.specs.map((spec, idx) => (
                                                <span key={idx} className="spec-tag">{spec}</span>
                                            ))}
                                            <span className="sku">SKU: {product.sku}</span>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="product-card__footer">
                                            <div className="price-info">
                                                <span className="price">${product.price.toFixed(2)}</span>
                                                {product.volumePricing && (
                                                    <span className="volume-note">Vol pricing available</span>
                                                )}
                                            </div>
                                            <button className="add-to-cart-btn">
                                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button className="pagination__btn">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="pagination__btn active">1</button>
                            <button className="pagination__btn">2</button>
                            <button className="pagination__btn">3</button>
                            <span className="pagination__dots">...</span>
                            <button className="pagination__btn">12</button>
                            <button className="pagination__btn">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ComponentsPage;
