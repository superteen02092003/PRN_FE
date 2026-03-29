import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import { getUsers } from '@/services/adminService';
import { exportService } from '@/services/exportService';
import type { AdminUserDto } from '@/types/admin.types';
import { toast } from 'react-toastify';

const AdminUsersPage = () => {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            toast.info('Đang xuất báo cáo, vui lòng đợi...', { autoClose: 2000 });
            await exportService.exportUsers();
            toast.success('Xuất Excel thành công!');
        } catch (error) {
            toast.error('Lỗi khi xuất Excel users');
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const result = await getUsers();
                setUsers(result);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        !searchTerm ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <AdminLayout title="Users">
            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search-input">
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="admin-stat-sub">
                        Total: <strong>{filteredUsers.length}</strong> users
                    </div>
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
                            group_add
                        </span>
                        {isExporting ? 'Đang xuất...' : 'Xuất Users'}
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading-spinner" />
                        <span className="admin-loading-text">Loading users...</span>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId}>
                                        <td style={{ fontWeight: 600 }}>#{user.userId}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    backgroundColor: user.roleName === 'Admin' ? '#dbeafe' : '#f0fdf4',
                                                    color: user.roleName === 'Admin' ? '#2463eb' : '#22c55e',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: '13px'
                                                }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{user.username}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`status-badge ${user.roleName === 'Admin' ? 'confirmed' : 'active'}`}>
                                                {user.roleName}
                                            </span>
                                        </td>
                                        <td>{user.phone || '—'}</td>
                                        <td>
                                            <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(user.createdAt)}</td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsersPage;
