import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminBrands, createBrand, updateBrand, deleteBrand } from '@/services/adminService';
import type { AdminBrandResponse } from '@/types/admin.types';
import { toast } from 'react-toastify';

const AdminBrandsPage = () => {
    const [brands, setBrands] = useState<AdminBrandResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formLogo, setFormLogo] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchBrands = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAdminBrands();
            setBrands(result);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load brands');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const filteredBrands = brands.filter(b =>
        !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateForm = () => {
        setEditingId(null);
        setFormName('');
        setFormLogo('');
        setShowForm(true);
    };

    const openEditForm = (brand: AdminBrandResponse) => {
        setEditingId(brand.brandId);
        setFormName(brand.name);
        setFormLogo(brand.logoUrl || '');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            toast.error('Brand name is required');
            return;
        }
        try {
            setSaving(true);
            const data = { name: formName.trim(), logoUrl: formLogo.trim() || undefined };
            if (editingId) {
                await updateBrand(editingId, data);
                toast.success('Brand updated successfully');
            } else {
                await createBrand(data);
                toast.success('Brand created successfully');
            }
            setShowForm(false);
            fetchBrands();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save brand');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await deleteBrand(id);
            toast.success(`Brand "${name}" deleted`);
            fetchBrands();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete brand');
        }
    };

    return (
        <AdminLayout title="Brands">
            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search-input">
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <button className="admin-btn primary" onClick={openCreateForm}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        Add Brand
                    </button>
                </div>
            </div>

            {/* Inline Form Modal */}
            {showForm && (
                <div className="admin-card" style={{ marginBottom: '24px', border: '2px solid #2463eb' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
                        {editingId ? 'Edit Brand' : 'New Brand'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Name *</label>
                                <input
                                    className="admin-form-input"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Brand name (2-100 characters)"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    autoFocus
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Logo URL</label>
                                <input
                                    className="admin-form-input"
                                    value={formLogo}
                                    onChange={(e) => setFormLogo(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    maxLength={255}
                                />
                            </div>
                        </div>
                        <div className="admin-form-actions">
                            <button type="submit" className="admin-btn primary" disabled={saving}>
                                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                            </button>
                            <button type="button" className="admin-btn ghost" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Brands Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading-spinner" />
                        <span className="admin-loading-text">Loading brands...</span>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Logo</th>
                                    <th>Name</th>
                                    <th>Products</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBrands.map((brand) => (
                                    <tr key={brand.brandId}>
                                        <td style={{ fontWeight: 600 }}>#{brand.brandId}</td>
                                        <td>
                                            {brand.logoUrl ? (
                                                <img
                                                    src={brand.logoUrl}
                                                    alt={brand.name}
                                                    style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9ca3af' }}>label</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{brand.name}</td>
                                        <td>
                                            <span className="status-badge confirmed">{brand.productCount} products</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="admin-btn ghost" title="Edit" onClick={() => openEditForm(brand)}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                </button>
                                                <button className="admin-btn ghost" title="Delete" onClick={() => handleDelete(brand.brandId, brand.name)} style={{ color: '#dc2626' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBrands.length === 0 && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No brands found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="admin-stat-sub" style={{ textAlign: 'right', marginTop: '12px' }}>
                    Total: <strong>{filteredBrands.length}</strong> brands
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBrandsPage;
