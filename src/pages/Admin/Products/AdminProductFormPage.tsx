import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { createProduct, updateProduct, uploadProductImages, deleteProductImage } from '@/services/adminService';
import { getProductDetail, getCategories, getBrands } from '@/services/productService';
import type { CategoryResponseDto, BrandResponseDto, ProductImageDto } from '@/types/product.types';
import { resolveImageUrl } from '@/utils/imageUrl';
import { toast } from 'react-toastify';

const AdminProductFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [brands, setBrands] = useState<BrandResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Existing images from backend (edit mode)
    const [existingImages, setExistingImages] = useState<ProductImageDto[]>([]);
    // New files to upload
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [form, setForm] = useState({
        name: '',
        sku: '',
        description: '',
        productType: 'MODULE',
        price: 0,
        stockQuantity: 0,
        brandId: 0,
        warrantyPolicyId: null as number | null,
        hasSerialTracking: false,
        categoryIds: [] as number[],
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, brs] = await Promise.all([getCategories(), getBrands()]);
                setCategories(cats);
                setBrands(brs);

                if (isEdit) {
                    setLoading(true);
                    const product = await getProductDetail(Number(id));
                    setForm({
                        name: product.name,
                        sku: product.sku,
                        description: product.description || '',
                        productType: product.productType,
                        price: product.price,
                        stockQuantity: product.stockQuantity,
                        brandId: product.brand?.brandId || 0,
                        warrantyPolicyId: product.warrantyPolicy?.warrantyId || null,
                        hasSerialTracking: false,
                        categoryIds: product.categories?.map(c => c.categoryId) || [],
                    });
                    setExistingImages(product.images || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, isEdit]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setNewFiles(prev => [...prev, ...files]);

        // Generate previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addFiles = useCallback((files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;
        setNewFiles(prev => [...prev, ...imageFiles]);
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    }, [addFiles]);

    const handleDeleteExistingImage = async (imageId: number) => {
        if (!confirm('Delete this image?')) return;
        try {
            await deleteProductImage(Number(id), imageId);
            setExistingImages(prev => prev.filter(img => img.imageId !== imageId));
            toast.success('Image deleted');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete image');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.name || !form.sku || form.brandId === 0) {
            setError('Name, SKU, and Brand are required');
            return;
        }

        try {
            setSaving(true);
            const data = {
                ...form,
                warrantyPolicyId: form.warrantyPolicyId || undefined,
            };

            let productId: number;

            if (isEdit) {
                await updateProduct(Number(id), data);
                productId = Number(id);
                toast.success('Product updated successfully');
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const created = await createProduct(data) as any;
                productId = created?.productId ?? created?.data?.productId ?? 0;
                toast.success('Product created successfully');
            }

            // Upload new images if any
            if (newFiles.length > 0) {
                setUploadingImages(true);
                try {
                    const primaryIdx = existingImages.length === 0 ? 0 : undefined;
                    await uploadProductImages(productId, newFiles, primaryIdx);
                    toast.success(`${newFiles.length} image(s) uploaded`);
                } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Failed to upload images');
                } finally {
                    setUploadingImages(false);
                }
            }

            navigate('/admin/products');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleCategoryToggle = (catId: number) => {
        setForm(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(catId)
                ? prev.categoryIds.filter(id => id !== catId)
                : [...prev.categoryIds, catId],
        }));
    };

    if (loading) {
        return (
            <AdminLayout title={isEdit ? 'Edit Product' : 'New Product'}>
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                    <span className="admin-loading-text">Loading...</span>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={isEdit ? 'Edit Product' : 'New Product'}>
            <div className="admin-card">
                <form className="admin-form" onSubmit={handleSubmit}>
                    {error && <div className="admin-form-error">{error}</div>}

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Name *</label>
                            <input
                                className="admin-form-input"
                                value={form.name}
                                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Product name"
                                required
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">SKU *</label>
                            <input
                                className="admin-form-input"
                                value={form.sku}
                                onChange={(e) => setForm(p => ({ ...p, sku: e.target.value }))}
                                placeholder="e.g. ARD-UNO-001"
                                required
                            />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <textarea
                            className="admin-form-textarea"
                            value={form.description}
                            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Product description..."
                        />
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Product Type *</label>
                            <select
                                className="admin-select"
                                value={form.productType}
                                onChange={(e) => setForm(p => ({ ...p, productType: e.target.value }))}
                                style={{ width: '100%' }}
                            >
                                <option value="MODULE">Module</option>
                                <option value="KIT">Kit</option>
                                <option value="COMPONENT">Component</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Brand *</label>
                            <select
                                className="admin-select"
                                value={form.brandId}
                                onChange={(e) => setForm(p => ({ ...p, brandId: Number(e.target.value) }))}
                                style={{ width: '100%' }}
                                required
                            >
                                <option value={0}>Select brand...</option>
                                {brands.map(b => <option key={b.brandId} value={b.brandId}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Price (VND) *</label>
                            <input
                                className="admin-form-input"
                                type="number"
                                min="0"
                                step="1000"
                                value={form.price}
                                onChange={(e) => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                                required
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Stock Quantity</label>
                            <input
                                className="admin-form-input"
                                type="number"
                                min="0"
                                value={form.stockQuantity}
                                onChange={(e) => setForm(p => ({ ...p, stockQuantity: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">Categories</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                            {categories.map(cat => (
                                <label
                                    key={cat.categoryId}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '13px',
                                        cursor: 'pointer',
                                        backgroundColor: form.categoryIds.includes(cat.categoryId) ? '#dbeafe' : '#f3f4f6',
                                        color: form.categoryIds.includes(cat.categoryId) ? '#1e40af' : '#374151',
                                        border: form.categoryIds.includes(cat.categoryId) ? '1px solid #93c5fd' : '1px solid transparent',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.categoryIds.includes(cat.categoryId)}
                                        onChange={() => handleCategoryToggle(cat.categoryId)}
                                        style={{ display: 'none' }}
                                    />
                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="admin-form-group">
                        <label className="admin-form-label" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'block' }}>
                            Product Images
                        </label>

                        {/* Image gallery: existing + new previews side by side */}
                        {(existingImages.length > 0 || newPreviews.length > 0) && (
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {existingImages.map(img => (
                                    <div key={img.imageId} style={{
                                        position: 'relative',
                                        width: '110px', height: '110px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: img.isPrimary ? '2px solid #2463eb' : '1px solid #e5e7eb',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    }}>
                                        <img
                                            src={resolveImageUrl(img.imageUrl) || ''}
                                            alt="Product"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {img.isPrimary && (
                                            <span style={{
                                                position: 'absolute', bottom: '4px', left: '4px',
                                                background: '#2463eb', color: 'white',
                                                fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                                                fontWeight: 700, letterSpacing: '0.3px',
                                            }}>PRIMARY</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingImage(img.imageId)}
                                            style={{
                                                position: 'absolute', top: '4px', right: '4px',
                                                background: 'rgba(0,0,0,0.5)', color: 'white',
                                                border: 'none', borderRadius: '50%',
                                                width: '22px', height: '22px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.9)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                                        </button>
                                    </div>
                                ))}
                                {newPreviews.map((preview, i) => (
                                    <div key={`new-${i}`} style={{
                                        position: 'relative',
                                        width: '110px', height: '110px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: '2px dashed #93c5fd',
                                        boxShadow: '0 2px 8px rgba(36,99,235,0.08)',
                                    }}>
                                        <img
                                            src={preview}
                                            alt={`New ${i + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                                        />
                                        <span style={{
                                            position: 'absolute', bottom: '4px', left: '4px',
                                            background: '#f59e0b', color: 'white',
                                            fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                                            fontWeight: 700,
                                        }}>NEW</span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewFile(i)}
                                            style={{
                                                position: 'absolute', top: '4px', right: '4px',
                                                background: 'rgba(0,0,0,0.5)', color: 'white',
                                                border: 'none', borderRadius: '50%',
                                                width: '22px', height: '22px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.9)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Drop zone */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                border: isDragging ? '2px solid #2463eb' : '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isDragging ? '#eff6ff' : '#f8fafc',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                if (!isDragging) {
                                    e.currentTarget.style.borderColor = '#93c5fd';
                                    e.currentTarget.style.background = '#f0f7ff';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isDragging) {
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                    e.currentTarget.style.background = '#f8fafc';
                                }
                            }}
                        >
                            <span className="material-symbols-outlined" style={{
                                fontSize: '40px',
                                color: isDragging ? '#2463eb' : '#94a3b8',
                                display: 'block',
                                marginBottom: '8px',
                                transition: 'color 0.2s',
                            }}>cloud_upload</span>
                            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                                {isDragging ? 'Drop images here' : 'Click to upload or drag & drop'}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                PNG, JPG, WEBP up to 5MB each
                            </p>
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button type="submit" className="admin-btn primary" disabled={saving || uploadingImages}>
                            {saving ? 'Saving...' : uploadingImages ? 'Uploading images...' : isEdit ? 'Update Product' : 'Create Product'}
                        </button>
                        <button type="button" className="admin-btn ghost" onClick={() => navigate('/admin/products')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminProductFormPage;
