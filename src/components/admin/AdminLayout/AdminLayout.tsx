import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import './AdminLayout.css';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: 'inventory_2', label: 'Products', path: '/admin/products' },
    { icon: 'receipt_long', label: 'Orders', path: '/admin/orders' },
    { icon: 'group', label: 'Users', path: '/admin/users' },
    { icon: 'label', label: 'Brands', path: '/admin/brands' },
    { icon: 'category', label: 'Categories', path: '/admin/categories' },
    { icon: 'reviews', label: 'Reviews', path: '/admin/reviews' },
    { icon: 'shield', label: 'Warranty Claims', path: '/admin/warranty-claims' },
    { icon: 'chat', label: 'Chat', path: '/admin/chat' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname.startsWith(path);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <Link to="/">
                        <div className="admin-sidebar-logo-icon">S</div>
                        <span className="admin-sidebar-logo-text">STEM Gear</span>
                    </Link>
                </div>

                <nav className="admin-sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <Link to="/profile" className="admin-sidebar-user">
                    <div className="admin-sidebar-user-avatar">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="admin-sidebar-user-info">
                        <div className="admin-sidebar-user-name">{user?.username || 'Admin'}</div>
                        <div className="admin-sidebar-user-role">{user?.role || 'Administrator'}</div>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.7 }}>
                        chevron_right
                    </span>
                </Link>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="admin-header-title">{title}</h1>
                        <span className="admin-badge">Admin</span>
                    </div>

                    <div className="admin-header-actions">
                        <Link to="/profile" className="admin-header-profile">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                            My Profile
                        </Link>
                        <button className="admin-logout-btn" onClick={handleLogout}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                            Log out
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
            `}</style>
        </div>
    );
};

export default AdminLayout;
