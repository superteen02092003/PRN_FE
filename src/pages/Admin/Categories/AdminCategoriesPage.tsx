import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '@/services/adminService';
import type { AdminCategoryResponse } from '@/types/admin.types';
import { toast } from 'react-toastify';
import { resolveImageUrl } from '@/utils/imageUrl';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const resetForm = () => {
        setFormName('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openCreateForm = () => {
        setEditingId(null);
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (cat: AdminCategoryResponse) => {
        setEditingId(cat.categoryId);
        setFormName(cat.name);
        setImageFile(null);
        setImagePreview(cat.imageUrl ? resolveImageUrl(cat.imageUrl) : null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowForm(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
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
            let categoryId: number;

            if (editingId) {
                const updated = await updateCategory(editingId, data);
                categoryId = updated.categoryId;
                toast.success('Category updated successfully');
            } else {
                const created = await createCategory(data);
                categoryId = created.categoryId;
                toast.success('Category created successfully');
            }

            // Upload image if selected
            if (imageFile) {
                try {
                    await uploadCategoryImage(categoryId, imageFile);
                    toast.success('Image uploaded successfully');
                } catch (imgErr) {
                    toast.error(imgErr instanceof Error ? imgErr.message : 'Failed to upload image');
                }
            }

            setShowForm(false);
            resetForm();
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

    const formatTime = (d: Date) =>
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    void formatTime;

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
                        <div className="admin-form-group">
                            <label className="admin-form-label">Category Image</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb' }}
                                    />
                                )}
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        className="admin-btn ghost"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_upload</span>
                                        {imageFile ? imageFile.name : 'Choose image...'}
                                    </button>
                                    <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                                        JPG, PNG, WebP. Max 5MB.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="admin-form-actions">
                            <button type="submit" className="admin-btn primary" disabled={saving}>
                                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                            </button>
                            <button type="button" className="admin-btn ghost" onClick={() => { setShowForm(false); resetForm(); }}>
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
                                    <th>Image</th>
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
                                            {cat.imageUrl ? (
                                                <img src={resolveImageUrl(cat.imageUrl) || ''} alt={cat.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#dbeafe', color: '#2463eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>category</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{cat.name}</span>
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
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No categories found</td></tr>
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
