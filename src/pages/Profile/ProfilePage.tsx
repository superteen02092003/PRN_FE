import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

const ProfilePage = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Fetch latest profile data
        const fetchProfile = async () => {
            setIsRefreshing(true);
            await refreshUser();
            setIsRefreshing(false);
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return { backgroundColor: '#fee2e2', color: '#dc2626' };
            case 'customer':
                return { backgroundColor: '#dbeafe', color: '#2463eb' };
            default:
                return { backgroundColor: '#f3f4f6', color: '#6b7280' };
        }
    };

    if (isRefreshing) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#F8F9FA'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#2463eb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#F8F9FA',
            minHeight: '100vh',
            padding: '40px 20px'
        }}>
            {/* Header Navigation */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    color: '#4d6599',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                </Link>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0e121b',
                    margin: 0
                }}>My Profile</h1>
            </div>

            {/* Profile Card */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                overflow: 'hidden'
            }}>
                {/* Cover Image */}
                <div style={{
                    height: '140px',
                    background: 'linear-gradient(135deg, #2463eb 0%, #1d4ed8 50%, #1e40af 100%)',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)'
                    }} />
                </div>

                {/* Avatar Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '-50px',
                    padding: '0 32px 32px',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#2463eb',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        fontWeight: 700,
                        color: 'white',
                        position: 'relative',
                        zIndex: 20
                    }}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <h2 style={{
                        marginTop: '16px',
                        marginBottom: '8px',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#0e121b'
                    }}>{user?.username || 'User'}</h2>

                    <span style={{
                        padding: '6px 16px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 600,
                        ...getRoleBadgeStyle(user?.role || '')
                    }}>{user?.role || 'User'}</span>
                </div>

                {/* Profile Details */}
                <div style={{
                    padding: '0 32px 32px'
                }}>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '16px'
                    }}>Account Information</h3>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {/* Email */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px'
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#2463eb', fontSize: '22px' }}>mail</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Email Address</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>{user?.email || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px'
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: '#f0fdf4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '22px' }}>phone</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Phone Number</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>{user?.phone || 'Not provided'}</div>
                            </div>
                        </div>

                        {/* Address */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px'
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: '#fef3c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '22px' }}>location_on</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Address</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>{user?.address || 'Not provided'}</div>
                            </div>
                        </div>

                        {/* Member Since */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px'
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: '#fce7f3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#ec4899', fontSize: '22px' }}>calendar_month</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Member Since</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    padding: '24px 32px',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                        Edit Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: '#fee2e2',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
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
                        Log Out
                    </button>
                </div>
            </div>

            {/* Admin Quick Link */}
            {user?.role?.toLowerCase() === 'admin' && (
                <div style={{
                    maxWidth: '800px',
                    margin: '24px auto 0',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '20px' }}>admin_panel_settings</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#0e121b', fontSize: '14px' }}>Admin Dashboard</div>
                            <div style={{ fontSize: '13px', color: '#9ca3af' }}>Access administrative controls</div>
                        </div>
                    </div>
                    <Link
                        to="/admin/dashboard"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            backgroundColor: '#2463eb',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Go to Dashboard
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </Link>
                </div>
            )}

            {/* Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
};

export default ProfilePage;
