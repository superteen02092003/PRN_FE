import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/services/adminService';
import type { AdminCategoryResponse } from '@/types/admin.types';
import { toast } from 'react-toastify';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAdminCategories();
            setCategories(result);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const filteredCategories = categories.filter(c =>
        !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateForm = () => {
        setEditingId(null);
        setFormName('');
        setShowForm(true);
    };

    const openEditForm = (cat: AdminCategoryResponse) => {
        setEditingId(cat.categoryId);
        setFormName(cat.name);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            toast.error('Category name is required');
            return;
        }
        try {
            setSaving(true);
            const data = { name: formName.trim() };
            if (editingId) {
                await updateCategory(editingId, data);
                toast.success('Category updated successfully');
            } else {
                await createCategory(data);
                toast.success('Category created successfully');
            }
            setShowForm(false);
            fetchCategories();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await deleteCategory(id);
            toast.success(`Category "${name}" deleted`);
            fetchCategories();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete category');
        }
    };

    return (
        <AdminLayout title="Categories">
            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search-input">
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <button className="admin-btn primary" onClick={openCreateForm}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        Add Category
                    </button>
                </div>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="admin-card" style={{ marginBottom: '24px', border: '2px solid #2463eb' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
                        {editingId ? 'Edit Category' : 'New Category'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Name *</label>
                            <input
                                className="admin-form-input"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Category name (2-100 characters)"
                                required
                                minLength={2}
                                maxLength={100}
                                autoFocus
                            />
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

            {/* Categories Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading-spinner" />
                        <span className="admin-loading-text">Loading categories...</span>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Products</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map((cat) => (
                                    <tr key={cat.categoryId}>
                                        <td style={{ fontWeight: 600 }}>#{cat.categoryId}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '6px',
                                                    backgroundColor: '#dbeafe', color: '#2463eb',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>category</span>
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-badge confirmed">{cat.productCount} products</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="admin-btn ghost" title="Edit" onClick={() => openEditForm(cat)}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                </button>
                                                <button className="admin-btn ghost" title="Delete" onClick={() => handleDelete(cat.categoryId, cat.name)} style={{ color: '#dc2626' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No categories found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="admin-stat-sub" style={{ textAlign: 'right', marginTop: '12px' }}>
                    Total: <strong>{filteredCategories.length}</strong> categories
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCategoriesPage;
