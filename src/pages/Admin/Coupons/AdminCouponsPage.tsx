import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getAdminCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/adminService';
import type { AdminCouponResponse, CreateCouponRequest, DiscountType } from '@/types/admin.types';
import { toast } from 'react-toastify';

const toInputDate = (iso: string) => iso.slice(0, 16); // "YYYY-MM-DDTHH:MM"
const toIsoString = (local: string) => new Date(local).toISOString();

const defaultForm = () => ({
    code: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 10,
    minOrderValue: '',
    maxDiscountAmount: '',
    startDate: toInputDate(new Date().toISOString()),
    endDate: toInputDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
    usageLimit: '',
});

const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState<AdminCouponResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(defaultForm());
    const [saving, setSaving] = useState(false);

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAdminCoupons();
            setCoupons(result);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const filtered = coupons.filter(c => {
        const matchSearch = !searchTerm || c.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? c.isActive : !c.isActive);
        return matchSearch && matchStatus;
    });

    const openCreate = () => {
        setEditingId(null);
        setForm(defaultForm());
        setShowForm(true);
    };

    const openEdit = (c: AdminCouponResponse) => {
        setEditingId(c.couponId);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            minOrderValue: c.minOrderValue != null ? String(c.minOrderValue) : '',
            maxDiscountAmount: c.maxDiscountAmount != null ? String(c.maxDiscountAmount) : '',
            startDate: toInputDate(c.startDate),
            endDate: toInputDate(c.endDate),
            usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(form.endDate) <= new Date(form.startDate)) {
            toast.error('End date must be after start date');
            return;
        }
        try {
            setSaving(true);
            const payload: CreateCouponRequest = {
                code: form.code.trim().toUpperCase(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                startDate: toIsoString(form.startDate),
                endDate: toIsoString(form.endDate),
                ...(form.minOrderValue ? { minOrderValue: Number(form.minOrderValue) } : {}),
                ...(form.maxDiscountAmount ? { maxDiscountAmount: Number(form.maxDiscountAmount) } : {}),
                ...(form.usageLimit ? { usageLimit: Number(form.usageLimit) } : {}),
            };

            if (editingId) {
                await updateCoupon(editingId, payload);
                toast.success('Coupon updated successfully');
            } else {
                await createCoupon(payload);
                toast.success('Coupon created successfully');
            }
            setShowForm(false);
            fetchCoupons();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, code: string) => {
        if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
        try {
            await deleteCoupon(id);
            toast.success(`Coupon "${code}" deleted`);
            fetchCoupons();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete coupon');
        }
    };

    const formatDiscount = (c: AdminCouponResponse) =>
        c.discountType === 'PERCENTAGE'
            ? `${c.discountValue}%`
            : `${c.discountValue.toLocaleString('vi-VN')}₫`;

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const formatCurrency = (v: number | null) =>
        v != null ? `${v.toLocaleString('vi-VN')}₫` : '—';

    return (
        <AdminLayout title="Coupons">
            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search-input">
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search by code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="admin-form-input"
                    style={{ width: 'auto', minWidth: '130px' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <div style={{ marginLeft: 'auto' }}>
                    <button className="admin-btn primary" onClick={openCreate}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        New Coupon
                    </button>
                </div>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="admin-card" style={{ marginBottom: '24px', border: '2px solid #2463eb' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
                        {editingId ? 'Edit Coupon' : 'New Coupon'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        {/* Row 1: Code + Discount Type */}
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Code *</label>
                                <input
                                    className="admin-form-input"
                                    value={form.code}
                                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SUMMER20"
                                    required
                                    minLength={3}
                                    maxLength={50}
                                    autoFocus
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Discount Type *</label>
                                <select
                                    className="admin-form-input"
                                    value={form.discountType}
                                    onChange={(e) => setForm(f => ({ ...f, discountType: e.target.value as DiscountType }))}
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED_AMOUNT">Fixed Amount (₫)</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    Discount Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(₫)'}
                                </label>
                                <input
                                    className="admin-form-input"
                                    type="number"
                                    value={form.discountValue}
                                    onChange={(e) => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
                                    min={0.01}
                                    max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                                    step={form.discountType === 'PERCENTAGE' ? 1 : 1000}
                                    required
                                />
                            </div>
                        </div>

                        {/* Row 2: Min Order + Max Discount */}
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Min Order Value (₫)</label>
                                <input
                                    className="admin-form-input"
                                    type="number"
                                    value={form.minOrderValue}
                                    onChange={(e) => setForm(f => ({ ...f, minOrderValue: e.target.value }))}
                                    placeholder="Leave blank for no minimum"
                                    min={0}
                                    step={1000}
                                />
                            </div>
                            {form.discountType === 'PERCENTAGE' && (
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Max Discount Amount (₫)</label>
                                    <input
                                        className="admin-form-input"
                                        type="number"
                                        value={form.maxDiscountAmount}
                                        onChange={(e) => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                                        placeholder="Leave blank for no cap"
                                        min={0}
                                        step={1000}
                                    />
                                </div>
                            )}
                            <div className="admin-form-group">
                                <label className="admin-form-label">Usage Limit</label>
                                <input
                                    className="admin-form-input"
                                    type="number"
                                    value={form.usageLimit}
                                    onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                                    placeholder="Leave blank for unlimited"
                                    min={1}
                                />
                            </div>
                        </div>

                        {/* Row 3: Dates */}
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Start Date *</label>
                                <input
                                    className="admin-form-input"
                                    type="datetime-local"
                                    value={form.startDate}
                                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">End Date *</label>
                                <input
                                    className="admin-form-input"
                                    type="datetime-local"
                                    value={form.endDate}
                                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                                    required
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

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading-spinner" />
                        <span className="admin-loading-text">Loading coupons...</span>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Type</th>
                                    <th>Discount</th>
                                    <th>Min Order</th>
                                    <th>Usage</th>
                                    <th>Valid Period</th>
                                    <th>Status</th>
                                    <th>Orders</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.couponId}>
                                        <td>
                                            <span style={{
                                                fontFamily: 'monospace', fontWeight: 700,
                                                background: '#f3f4f6', padding: '2px 8px',
                                                borderRadius: '4px', fontSize: '13px'
                                            }}>
                                                {c.code}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${c.discountType === 'PERCENTAGE' ? 'confirmed' : 'shipped'}`}>
                                                {c.discountType === 'PERCENTAGE' ? '%' : '₫ Fixed'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{formatDiscount(c)}</td>
                                        <td style={{ fontSize: '13px' }}>{formatCurrency(c.minOrderValue)}</td>
                                        <td style={{ fontSize: '13px' }}>
                                            {c.usedCount}
                                            {c.usageLimit != null ? `/${c.usageLimit}` : ' / ∞'}
                                        </td>
                                        <td style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {formatDate(c.startDate)} – {formatDate(c.endDate)}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${c.isActive ? 'delivered' : 'cancelled'}`}>
                                                {c.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '13px' }}>{c.orderCount}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="admin-btn ghost" title="Edit" onClick={() => openEdit(c)}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                </button>
                                                <button
                                                    className="admin-btn ghost"
                                                    title={c.orderCount > 0 ? 'Cannot delete — used in orders' : 'Delete'}
                                                    onClick={() => handleDelete(c.couponId, c.code)}
                                                    disabled={c.orderCount > 0}
                                                    style={{ color: c.orderCount > 0 ? '#d1d5db' : '#dc2626' }}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                            No coupons found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="admin-stat-sub" style={{ textAlign: 'right', marginTop: '12px' }}>
                    Total: <strong>{filtered.length}</strong> coupon(s)
                    {' · '}
                    Active: <strong>{coupons.filter(c => c.isActive).length}</strong>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCouponsPage;
