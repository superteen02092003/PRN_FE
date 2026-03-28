import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { createProduct, updateProduct, uploadProductImages, deleteProductImage, createKit, addProductToBundle, removeProductFromBundle, getWarrantyPolicies } from '@/services/adminService';
import type { WarrantyPolicyOption } from '@/services/adminService';
import { getProductDetail, getCategories, getBrands, getProducts } from '@/services/productService';
import type { CategoryResponseDto, BrandResponseDto, ProductImageDto, BundleItemDto, SpecificationDto, DocumentDto } from '@/types/product.types';
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
    const [warrantyPolicies, setWarrantyPolicies] = useState<WarrantyPolicyOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Existing images from backend (edit mode)
    const [existingImages, setExistingImages] = useState<ProductImageDto[]>([]);
    // New files to upload
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    // STEM feature states
    interface SpecRow { specName: string; specValue: string; displayOrder: number; }
    interface DocRow { documentType: string; title: string; url: string; displayOrder: number; }
    const [specs, setSpecs] = useState<SpecRow[]>([]);
    const [docs, setDocs] = useState<DocRow[]>([]);

    // KIT bundle state
    interface KitComponent {
        productId: number;
        name: string;
        sku: string;
        price: number;
        quantity: number;
    }
    const [kitComponents, setKitComponents] = useState<KitComponent[]>([]);
    const [originalComponents, setOriginalComponents] = useState<KitComponent[]>([]);
    const [componentSearch, setComponentSearch] = useState('');
    const [componentResults, setComponentResults] = useState<{ productId: number; name: string; sku: string; price: number; productType: string }[]>([]);
    const [searchingComponents, setSearchingComponents] = useState(false);

    const [form, setForm] = useState({
        name: '',
        sku: '',
        description: '',
        compatibilityInfo: '',
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
                const [cats, brs, policies] = await Promise.all([getCategories(), getBrands(), getWarrantyPolicies()]);
                setCategories(cats);
                setBrands(brs);
                setWarrantyPolicies(policies);

                if (isEdit) {
                    setLoading(true);
                    const product = await getProductDetail(Number(id));
                    setForm({
                        name: product.name,
                        sku: product.sku,
                        description: product.description || '',
                        compatibilityInfo: product.compatibilityInfo || '',
                        productType: product.productType,
                        price: product.price,
                        stockQuantity: product.stockQuantity,
                        brandId: product.brand?.brandId || 0,
                        warrantyPolicyId: product.warrantyPolicy?.warrantyId || null,
                        hasSerialTracking: false,
                        categoryIds: product.categories?.map(c => c.categoryId) || [],
                    });
                    setExistingImages(product.images || []);
                    if (product.specifications) {
                        setSpecs(product.specifications.map((s: SpecificationDto) => ({
                            specName: s.specName, specValue: s.specValue, displayOrder: s.displayOrder,
                        })));
                    }
                    if (product.documents) {
                        setDocs(product.documents.map((d: DocumentDto) => ({
                            documentType: d.documentType, title: d.title, url: d.url, displayOrder: d.displayOrder,
                        })));
                    }
                    // Load existing KIT components
                    if (product.productType === 'KIT' && product.bundleComponents) {
                        const comps: KitComponent[] = product.bundleComponents.map((b: BundleItemDto) => ({
                            productId: b.productId,
                            name: b.name,
                            sku: b.sku || '',
                            price: b.price || 0,
                            quantity: b.quantity,
                        }));
                        setKitComponents(comps);
                        setOriginalComponents(comps);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, isEdit]);

    // Component search for KIT
    useEffect(() => {
        if (componentSearch.length < 2) {
            setComponentResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setSearchingComponents(true);
                const data = await getProducts({ search: componentSearch, pageSize: 10 });
                // Filter out KIT products and already-added products
                const added = new Set(kitComponents.map(c => c.productId));
                const filtered = (data.items || []).filter(
                    (p: { productId: number; productType?: string }) => p.productType !== 'KIT' && !added.has(p.productId)
                );
                setComponentResults(filtered.map((p: { productId: number; name: string; sku: string; price: number; productType: string }) => ({
                    productId: p.productId, name: p.name, sku: p.sku, price: p.price, productType: p.productType,
                })));
            } catch {
                setComponentResults([]);
            } finally {
                setSearchingComponents(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [componentSearch, kitComponents]);

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

        // KIT validation
        if (form.productType === 'KIT' && !isEdit && kitComponents.length === 0) {
            setError('KIT must have at least 1 component');
            return;
        }

        try {
            setSaving(true);
            let productId: number;

            if (isEdit) {
                const data = {
                    ...form,
                    compatibilityInfo: form.compatibilityInfo || undefined,
                    warrantyPolicyId: form.warrantyPolicyId || undefined,
                    specifications: specs,
                    documents: docs,
                };
                await updateProduct(Number(id), data);
                productId = Number(id);

                // Handle KIT component changes (add/remove)
                if (form.productType === 'KIT') {
                    const origIds = new Set(originalComponents.map(c => c.productId));
                    const newIds = new Set(kitComponents.map(c => c.productId));

                    // Remove components that were in original but not in current
                    for (const oc of originalComponents) {
                        if (!newIds.has(oc.productId)) {
                            try {
                                await removeProductFromBundle(productId, oc.productId);
                            } catch (err) {
                                toast.error(`Failed to remove ${oc.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                            }
                        }
                    }
                    // Add new components
                    for (const nc of kitComponents) {
                        if (!origIds.has(nc.productId)) {
                            try {
                                await addProductToBundle(productId, nc.productId, nc.quantity);
                            } catch (err) {
                                toast.error(`Failed to add ${nc.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                            }
                        }
                    }
                }
                toast.success('Product updated successfully');
            } else if (form.productType === 'KIT') {
                // Create KIT with components atomically
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const created = await createKit({
                    name: form.name,
                    sku: form.sku,
                    description: form.description || undefined,
                    compatibilityInfo: form.compatibilityInfo || undefined,
                    price: form.price,
                    brandId: form.brandId,
                    warrantyPolicyId: form.warrantyPolicyId || undefined,
                    categoryIds: form.categoryIds,
                    specifications: specs,
                    documents: docs,
                    components: kitComponents.map(c => ({ productId: c.productId, quantity: c.quantity })),
                }) as any;
                productId = created?.productId ?? created?.data?.productId ?? 0;
                toast.success('Kit created successfully');
            } else {
                const data = {
                    ...form,
                    compatibilityInfo: form.compatibilityInfo || undefined,
                    warrantyPolicyId: form.warrantyPolicyId || undefined,
                    specifications: specs,
                    documents: docs,
                };
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

                    {/* Compatibility Info */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">Thông tin tương thích</label>
                        <input
                            className="admin-form-input"
                            value={form.compatibilityInfo}
                            onChange={(e) => setForm(p => ({ ...p, compatibilityInfo: e.target.value }))}
                            placeholder="Ví dụ: Arduino Uno, ESP32, Raspberry Pi..."
                            maxLength={2000}
                        />
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            Hiển thị tại trang chi tiết sản phẩm giúp người mua biết phần cứng tương thích.
                        </p>
                    </div>

                    {/* Technical Specifications */}
                    <div className="admin-form-group" style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <label className="admin-form-label" style={{ fontSize: '15px', fontWeight: 700, marginBottom: 0 }}>
                                Thông số kỹ thuật
                            </label>
                            <button
                                type="button"
                                onClick={() => setSpecs(prev => [...prev, { specName: '', specValue: '', displayOrder: prev.length }])}
                                style={{ padding: '4px 12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', color: '#1d4ed8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                + Thêm thông số
                            </button>
                        </div>
                        {specs.length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có thông số nào. Nhấn "+ Thêm thông số" để bắt đầu.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {specs.map((spec, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            className="admin-form-input"
                                            value={spec.specName}
                                            onChange={(e) => setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, specName: e.target.value } : s))}
                                            placeholder="Tên thông số (VD: Điện áp)"
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            className="admin-form-input"
                                            value={spec.specValue}
                                            onChange={(e) => setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, specValue: e.target.value } : s))}
                                            placeholder="Giá trị (VD: 3.3V - 5V)"
                                            style={{ flex: 2 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSpecs(prev => prev.filter((_, i) => i !== idx))}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Documents */}
                    <div className="admin-form-group" style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <label className="admin-form-label" style={{ fontSize: '15px', fontWeight: 700, marginBottom: 0 }}>
                                Tài liệu đi kèm
                            </label>
                            <button
                                type="button"
                                onClick={() => setDocs(prev => [...prev, { documentType: 'DATASHEET', title: '', url: '', displayOrder: prev.length }])}
                                style={{ padding: '4px 12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', color: '#1d4ed8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                + Thêm tài liệu
                            </button>
                        </div>
                        {docs.length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có tài liệu. Nhấn "+ Thêm tài liệu" để thêm datasheet, pinout, tutorial...</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {docs.map((doc, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <select
                                            value={doc.documentType}
                                            onChange={(e) => setDocs(prev => prev.map((d, i) => i === idx ? { ...d, documentType: e.target.value } : d))}
                                            className="admin-select"
                                            style={{ width: '140px', flexShrink: 0 }}
                                        >
                                            <option value="DATASHEET">Datasheet</option>
                                            <option value="TUTORIAL">Tutorial</option>
                                            <option value="PINOUT">Pinout</option>
                                            <option value="CODE_EXAMPLE">Code mẫu</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                        <input
                                            className="admin-form-input"
                                            value={doc.title}
                                            onChange={(e) => setDocs(prev => prev.map((d, i) => i === idx ? { ...d, title: e.target.value } : d))}
                                            placeholder="Tiêu đề (VD: Arduino Uno Datasheet)"
                                            style={{ flex: 1, minWidth: '120px' }}
                                        />
                                        <input
                                            className="admin-form-input"
                                            value={doc.url}
                                            onChange={(e) => setDocs(prev => prev.map((d, i) => i === idx ? { ...d, url: e.target.value } : d))}
                                            placeholder="URL tài liệu"
                                            style={{ flex: 2, minWidth: '180px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setDocs(prev => prev.filter((_, i) => i !== idx))}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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

                    {/* Warranty Policy */}
                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Warranty Policy</label>
                            <select
                                className="admin-select"
                                value={form.warrantyPolicyId ?? ''}
                                onChange={(e) => setForm(p => ({ ...p, warrantyPolicyId: e.target.value ? Number(e.target.value) : null }))}
                                style={{ width: '100%' }}
                            >
                                <option value="">No warranty</option>
                                {warrantyPolicies.map(wp => (
                                    <option key={wp.policyId} value={wp.policyId}>
                                        {wp.policyName} ({wp.durationMonths} months)
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                Products with a warranty policy will auto-create warranties when orders are delivered.
                            </p>
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

                    {/* KIT Components Section (only when productType is KIT) */}
                    {form.productType === 'KIT' && (
                        <div className="admin-form-group" style={{ marginTop: '8px' }}>
                            <label className="admin-form-label" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'block' }}>
                                Kit Components {!isEdit && <span style={{ color: '#ef4444' }}>*</span>}
                            </label>

                            {/* Current components list */}
                            {kitComponents.length > 0 && (
                                <div style={{ marginBottom: '14px' }}>
                                    {kitComponents.map((comp, idx) => (
                                        <div key={comp.productId} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '10px 14px', background: '#f8fafc',
                                            borderRadius: '8px', marginBottom: '6px',
                                            border: '1px solid #e2e8f0',
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                                                    {comp.name}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                    SKU: {comp.sku} · ₫{comp.price.toLocaleString()}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <label style={{ fontSize: '12px', color: '#64748b' }}>Qty:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={comp.quantity}
                                                    onChange={(e) => {
                                                        const qty = Math.max(1, Number(e.target.value));
                                                        setKitComponents(prev => prev.map((c, i) => i === idx ? { ...c, quantity: qty } : c));
                                                    }}
                                                    style={{
                                                        width: '60px', padding: '4px 8px',
                                                        border: '1px solid #d1d5db', borderRadius: '6px',
                                                        fontSize: '13px', textAlign: 'center',
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setKitComponents(prev => prev.filter((_, i) => i !== idx))}
                                                style={{
                                                    background: 'none', border: 'none',
                                                    color: '#ef4444', cursor: 'pointer',
                                                    padding: '4px', display: 'flex',
                                                }}
                                                title="Remove component"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search to add component */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="admin-form-input"
                                    placeholder="Search products to add (type at least 2 chars)..."
                                    value={componentSearch}
                                    onChange={(e) => setComponentSearch(e.target.value)}
                                />
                                {searchingComponents && (
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>
                                        Searching...
                                    </div>
                                )}
                                {componentResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        background: 'white', border: '1px solid #e2e8f0',
                                        borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        zIndex: 50, maxHeight: '200px', overflowY: 'auto',
                                    }}>
                                        {componentResults.map(r => (
                                            <div
                                                key={r.productId}
                                                onClick={() => {
                                                    setKitComponents(prev => [...prev, {
                                                        productId: r.productId, name: r.name,
                                                        sku: r.sku, price: r.price, quantity: 1,
                                                    }]);
                                                    setComponentSearch('');
                                                    setComponentResults([]);
                                                }}
                                                style={{
                                                    padding: '10px 14px', cursor: 'pointer',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    transition: 'background 0.1s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                            >
                                                <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{r.name}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                    {r.productType} · SKU: {r.sku} · ₫{r.price.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {kitComponents.length === 0 && (
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                    No components added yet. Search for products above to add them to this kit.
                                </p>
                            )}
                        </div>
                    )}

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
