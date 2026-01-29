import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';

// Mock data for charts
const userBehaviorData = [
    { time: '9:00AM', open: 100, click: 80, secondTime: 60 },
    { time: '12:00AM', open: 280, click: 200, secondTime: 140 },
    { time: '3:00PM', open: 350, click: 280, secondTime: 180 },
    { time: '6:00PM', open: 400, click: 350, secondTime: 220 },
    { time: '9:00PM', open: 480, click: 400, secondTime: 280 },
    { time: '12:00PM', open: 550, click: 480, secondTime: 350 },
    { time: '3:00AM', open: 620, click: 550, secondTime: 400 },
    { time: '6:00AM', open: 700, click: 600, secondTime: 450 },
];

const emailStatsData = [
    { name: 'Open', value: 40, color: '#4ade80' },
    { name: 'Bounce', value: 40, color: '#f97316' },
    { name: 'Unsubscribe', value: 20, color: '#ef4444' },
];

const salesData = [
    { country: 'USA', sales: 2500, percentage: 29 },
    { country: 'Germany', sales: 3900, percentage: 20 },
    { country: 'Australia', sales: 760, percentage: 10 },
    { country: 'United Kingdom', sales: 1400, percentage: 14 },
];

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const menuItems = [
        { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
        { icon: 'group', label: 'User Management', path: '/admin/users' },
        { icon: 'table_chart', label: 'Table List', path: '/admin/tables' },
        { icon: 'text_fields', label: 'Typography', path: '/admin/typography' },
        { icon: 'emoji_symbols', label: 'Icons', path: '/admin/icons' },
        { icon: 'map', label: 'Maps', path: '/admin/maps' },
        { icon: 'notifications', label: 'Notifications', path: '/admin/notifications' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#f3f4f6'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: '#1a1a2e',
                backgroundImage: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95), rgba(26, 26, 46, 0.98)), url("https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=400")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                {/* Logo */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'white'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#2463eb',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '18px'
                        }}>S</div>
                        <span style={{
                            fontWeight: 700,
                            fontSize: '18px',
                            letterSpacing: '-0.02em'
                        }}>STEM Gear</span>
                    </Link>
                </div>

                {/* Menu Items */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '14px 16px',
                                marginBottom: '4px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.7)',
                                backgroundColor: isActive(item.path) ? '#2463eb' : 'transparent',
                                transition: 'all 0.2s ease',
                                fontSize: '14px',
                                fontWeight: isActive(item.path) ? 600 : 500
                            }}
                            onMouseOver={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                }
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User Section - Clickable to Profile */}
                <Link
                    to="/profile"
                    style={{
                        padding: '16px 20px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'white',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#2463eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px'
                    }}>
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{user?.username || 'Admin'}</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{user?.role || 'Administrator'}</div>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.7 }}>chevron_right</span>
                </Link>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '260px',
                minHeight: '100vh'
            }}>
                {/* Top Header */}
                <header style={{
                    backgroundColor: 'white',
                    padding: '16px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e5e7eb',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#0e121b',
                            margin: 0
                        }}>Dashboard</h1>
                        <span style={{
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 600
                        }}>Admin</span>
                    </div>

                    {/* Search Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: '#f3f4f6',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        width: '300px'
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                width: '100%',
                                fontSize: '14px',
                                color: '#374151'
                            }}
                        />
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link
                            to="/profile"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#4b5563',
                                fontSize: '14px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                borderRadius: '6px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                            My Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                backgroundColor: '#fee2e2',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#dc2626',
                                fontSize: '14px',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#fecaca';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                            Log out
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div style={{ padding: '32px' }}>
                    {/* Stats Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        {/* Storage Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                            }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#2463eb', fontSize: '28px' }}>cloud</span>
                            </div>
                            <div>
                                <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Storage</div>
                                <div style={{ color: '#0e121b', fontSize: '24px', fontWeight: 700 }}>150GB</div>
                                <div style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
                                    Update Now
                                </div>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                            }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#fef3c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '28px' }}>paid</span>
                            </div>
                            <div>
                                <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Revenue</div>
                                <div style={{ color: '#0e121b', fontSize: '24px', fontWeight: 700 }}>$1,345</div>
                                <div style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                                    Last day
                                </div>
                            </div>
                        </div>

                        {/* Errors Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                            }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#fce7f3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#ec4899', fontSize: '28px' }}>bug_report</span>
                            </div>
                            <div>
                                <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Errors</div>
                                <div style={{ color: '#0e121b', fontSize: '24px', fontWeight: 700 }}>23</div>
                                <div style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                                    In the last hour
                                </div>
                            </div>
                        </div>

                        {/* Followers Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                            }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#f0fdf4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '28px' }}>favorite</span>
                            </div>
                            <div>
                                <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Followers</div>
                                <div style={{ color: '#0e121b', fontSize: '24px', fontWeight: 700 }}>+45K</div>
                                <div style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
                                    Update now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        {/* Line Chart */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0e121b' }}>Users Behavior</h3>
                                <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '13px' }}>24 Hours performance</p>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={userBehaviorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Open" />
                                    <Line type="monotone" dataKey="click" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} name="Click" />
                                    <Line type="monotone" dataKey="secondTime" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} name="Second Time" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f3f4f6',
                                color: '#9ca3af',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                                Updated 3 minutes ago
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0e121b' }}>Email Statistics</h3>
                                <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '13px' }}>Last Campaign Performance</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={emailStatsData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={50}
                                        dataKey="value"
                                        label={({ value }) => `${value}%`}
                                        labelLine={false}
                                    >
                                        {emailStatsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '20px',
                                marginTop: '12px'
                            }}>
                                {emailStatsData.map((item) => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }} />
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f3f4f6',
                                color: '#9ca3af',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>campaign</span>
                                Campaign sent 2 days ago
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px'
                    }}>
                        {/* Sales Table */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0e121b' }}>2024 Sales</h3>
                                <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '13px' }}>All products including Taxes</p>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 0', color: '#9ca3af', fontWeight: 500, fontSize: '13px' }}>Country</th>
                                        <th style={{ textAlign: 'right', padding: '12px 0', color: '#9ca3af', fontWeight: 500, fontSize: '13px' }}>Sales</th>
                                        <th style={{ textAlign: 'right', padding: '12px 0', color: '#9ca3af', fontWeight: 500, fontSize: '13px' }}>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.map((row, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '14px 0', color: '#374151', fontSize: '14px' }}>{row.country}</td>
                                            <td style={{ padding: '14px 0', color: '#374151', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>${row.sales.toLocaleString()}</td>
                                            <td style={{ padding: '14px 0', textAlign: 'right' }}>
                                                <span style={{
                                                    backgroundColor: '#dbeafe',
                                                    color: '#2463eb',
                                                    padding: '4px 10px',
                                                    borderRadius: '999px',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                }}>{row.percentage}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tasks */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0e121b' }}>Tasks</h3>
                                <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '13px' }}>Backend development</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { title: 'Sign contract for "What are conference organizers looking for?"', done: true },
                                    { title: 'Lines From Great Russian Literature? Or E-mstrings?', done: false },
                                    { title: 'Flooded: One year later, is it worth millions?', done: true },
                                    { title: 'Create 4 Invisible Typography Alternatives', done: false },
                                ].map((task, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '4px',
                                            border: task.done ? 'none' : '2px solid #d1d5db',
                                            backgroundColor: task.done ? '#22c55e' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {task.done && (
                                                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '14px' }}>check</span>
                                            )}
                                        </div>
                                        <span style={{
                                            fontSize: '13px',
                                            color: task.done ? '#9ca3af' : '#374151',
                                            textDecoration: task.done ? 'line-through' : 'none',
                                            flex: 1
                                        }}>{task.title}</span>
                                        <button style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#9ca3af',
                                            padding: '4px'
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
                
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
