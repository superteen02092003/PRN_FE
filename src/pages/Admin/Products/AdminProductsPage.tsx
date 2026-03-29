import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminProducts, deleteProduct } from '@/services/adminService';
import { getCategories, getBrands } from '@/services/productService';
import { exportService } from '@/services/exportService';
import type { AdminProductResponse, AdminProductFilter } from '@/types/admin.types';
import type { CategoryResponseDto, BrandResponseDto } from '@/types/product.types';
import { resolveImageUrl } from '@/utils/imageUrl';
import { toast } from 'react-toastify';

const AdminProductsPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<AdminProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [brands, setBrands] = useState<BrandResponseDto[]>([]);
    const [filter, setFilter] = useState<AdminProductFilter>({
        pageNumber: 1,
        pageSize: 15,
    });
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            toast.info('Đang xuất báo cáo, vui lòng đợi...', { autoClose: 2000 });
            await exportService.exportProducts(filter);
            toast.success('Xuất Excel thành công!');
        } catch (error) {
            toast.error('Lỗi khi xuất Excel products');
        } finally {
            setIsExporting(false);
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAdminProducts(filter);
            setProducts(result.items);
            setTotalCount(result.totalCount);
            setTotalPages(result.totalPages);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [cats, brs] = await Promise.all([getCategories(), getBrands()]);
                setCategories(cats);
                setBrands(brs);
            } catch { /* ignore */ }
        };
        loadFilters();
    }, []);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
        try {
            const message = await deleteProduct(id);
            toast.success(message);
            fetchProducts();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Xóa sản phẩm thất bại');
        }
    };

    const handleSearch = (value: string) => {
        setFilter(prev => ({ ...prev, search: value || undefined, pageNumber: 1 }));
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <AdminLayout title="Products">
            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search-input">
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search products..."
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <select
                    className="admin-select"
                    value={filter.categoryId || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined, pageNumber: 1 }))}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                </select>
                <select
                    className="admin-select"
                    value={filter.brandId || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, brandId: e.target.value ? Number(e.target.value) : undefined, pageNumber: 1 }))}
                >
                    <option value="">All Brands</option>
                    {brands.map(b => <option key={b.brandId} value={b.brandId}>{b.name}</option>)}
                </select>
                <select
                    className="admin-select"
                    value={filter.productType || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, productType: e.target.value || undefined, pageNumber: 1 }))}
                >
                    <option value="">All Types</option>
                    <option value="MODULE">Module</option>
                    <option value="KIT">Kit</option>
                    <option value="COMPONENT">Component</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={filter.lowStock || false}
                        onChange={(e) => setFilter(prev => ({ ...prev, lowStock: e.target.checked || undefined, pageNumber: 1 }))}
                    />
                    Low Stock Only
                </label>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={handleExport} 
                        disabled={isExporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#10b981', // emerald-500
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isExporting ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            opacity: isExporting ? 0.7 : 1,
                            transition: 'all 0.2sease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            view_list
                        </span>
                        {isExporting ? 'Đang xuất...' : 'Xuất Kho Excel'}
                    </button>
                    <button className="admin-btn primary" onClick={() => navigate('/admin/products/new')}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading-spinner" />
                        <span className="admin-loading-text">Loading products...</span>
                    </div>
                ) : (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>SKU</th>
                                        <th>Type</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Brand</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => (
                                        <tr key={p.productId}>
                                            <td>
                                                {p.primaryImage ? (
                                                    <img src={resolveImageUrl(p.primaryImage) || ''} alt={p.name} className="admin-product-image" />
                                                ) : (
                                                    <div className="admin-product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#9ca3af' }}>image</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.name}
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{p.sku}</td>
                                            <td><span className="status-badge confirmed">{p.productType}</span></td>
                                            <td style={{ fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: p.lowStock ? '#f59e0b' : p.stockQuantity === 0 ? '#ef4444' : '#374151' }}>
                                                    {p.stockQuantity}
                                                </span>
                                                {p.lowStock && <span className="status-badge low-stock" style={{ marginLeft: '8px' }}>Low</span>}
                                            </td>
                                            <td>{p.brandName || '—'}</td>
                                            <td>
                                                <span className={`status-badge ${p.isActive ? 'active' : 'inactive'}`}>
                                                    {p.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button className="admin-btn ghost" title="Edit" onClick={() => navigate(`/admin/products/${p.productId}/edit`)}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                    </button>
                                                    <button className="admin-btn ghost" title="Delete" onClick={() => handleDelete(p.productId, p.name)} style={{ color: '#dc2626' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr><td colSpan={9} className="admin-empty">No products found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="admin-pagination">
                            <span className="admin-pagination-info">
                                Showing {products.length} of {totalCount} products
                            </span>
                            <div className="admin-pagination-buttons">
                                <button
                                    className="admin-pagination-btn"
                                    disabled={filter.pageNumber === 1}
                                    onClick={() => setFilter(prev => ({ ...prev, pageNumber: (prev.pageNumber || 1) - 1 }))}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`admin-pagination-btn ${filter.pageNumber === page ? 'active' : ''}`}
                                        onClick={() => setFilter(prev => ({ ...prev, pageNumber: page }))}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    className="admin-pagination-btn"
                                    disabled={filter.pageNumber === totalPages || totalPages === 0}
                                    onClick={() => setFilter(prev => ({ ...prev, pageNumber: (prev.pageNumber || 1) + 1 }))}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminProductsPage;
