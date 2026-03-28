import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService, { RegisterRequest, ApiError } from '../../services/authService';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        agreeTerms: false,
    });
    const location = useLocation();

    // Check for error message from OAuth redirect
    useEffect(() => {
        if (location.state?.error) {
            setError(location.state.error);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Password strength calculation
    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthLabels = ['Weak', 'Fair', 'Medium', 'Strong'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.agreeTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);

        try {
            // Note: confirmPassword is only for frontend validation, not sent to API
            const registerData: RegisterRequest = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
            };

            await authService.register(registerData);
            // Response is just a success string message from BE

            // Redirect to login page on success
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err: unknown) {
            console.error('Registration failed:', err);
            const axiosError = err as { response?: { data?: string | ApiError } };
            if (typeof axiosError.response?.data === 'string') {
                setError(axiosError.response.data);
            } else if (axiosError.response?.data?.message) {
                setError(axiosError.response.data.message);
            } else if (axiosError.response?.data?.errors) {
                const errorMessages = Object.values(axiosError.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#F8F9FA',
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            overflow: 'hidden',
            color: '#0e121b'
        }}>
            {/* Left Panel: Brand Hero */}
            <div style={{
                display: 'none',
                width: '50%',
                height: '100vh',
                position: 'relative',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                backgroundColor: 'black',
                overflow: 'hidden'
            }} className="lg:!flex">
                {/* Background Video */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                >
                    <source src="https://videos.pexels.com/video-files/3141210/3141210-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                </video>

                {/* Overlay Gradients */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, #0e121b, rgba(14, 18, 27, 0.7), rgba(36, 99, 235, 0.1))',
                    mixBlendMode: 'multiply'
                }}></div>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent, transparent)'
                }}></div>

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    padding: '48px',
                    paddingBottom: '72px',
                    maxWidth: '500px'
                }}>
                    <h1 style={{
                        color: 'white',
                        letterSpacing: '-0.02em',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        lineHeight: '1.1'
                    }}>Start Building Today.</h1>
                    <p style={{
                        color: '#d1d5db',
                        marginTop: '12px',
                        fontSize: '15px',
                        fontWeight: 400,
                        maxWidth: '380px',
                        lineHeight: '1.5',
                        opacity: 0.9
                    }}>
                        Join thousands of engineers with access to exclusive datasheets, BOM lists, and real-time inventory tracking.
                    </p>
                </div>
            </div>

            {/* Right Panel: Register Form */}
            <div style={{
                width: '100%',
                height: '100vh',
                backgroundColor: '#F8F9FA',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 48px',
                overflowY: 'auto'
            }} className="lg:!w-1/2">
                <div style={{
                    width: '100%',
                    maxWidth: '360px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {/* Header Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Back Button + Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <Link to="/" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                color: '#4d6599',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    height: '28px',
                                    width: '28px',
                                    backgroundColor: '#2463eb',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: '16px'
                                }}>S</div>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '-0.02em' }}>STEM Gear</span>
                            </div>
                        </div>

                        <h2 style={{
                            color: '#0e121b',
                            fontSize: '1.75rem',
                            fontWeight: 900,
                            lineHeight: '1.1',
                            letterSpacing: '-0.033em'
                        }}>Create Your Account</h2>
                        <p style={{
                            color: '#4d6599',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '1.4'
                        }}>Already have an ID? <Link to="/login" style={{ color: '#2463eb', fontWeight: 600 }}>Log in</Link></p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontSize: '13px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Username */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{
                                color: '#0e121b',
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.025em'
                            }} htmlFor="username">Username</label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    fontSize: '18px'
                                }}>person</span>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="e.g. tumiz"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        padding: '0 14px 0 40px',
                                        fontSize: '14px',
                                        color: '#0e121b',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{
                                color: '#0e121b',
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.025em'
                            }} htmlFor="email">Email</label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    fontSize: '18px'
                                }}>mail</span>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        padding: '0 14px 0 40px',
                                        fontSize: '14px',
                                        color: '#0e121b',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{
                                color: '#0e121b',
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.025em'
                            }} htmlFor="phone">Phone</label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    fontSize: '18px'
                                }}>phone</span>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="e.g. 0917213712"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        padding: '0 14px 0 40px',
                                        fontSize: '14px',
                                        color: '#0e121b',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{
                                color: '#0e121b',
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.025em'
                            }} htmlFor="address">Address</label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    fontSize: '18px'
                                }}>location_on</span>
                                <input
                                    type="text"
                                    id="address"
                                    placeholder="e.g. HCM"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        padding: '0 14px 0 40px',
                                        fontSize: '14px',
                                        color: '#0e121b',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{
                                color: '#0e121b',
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.025em'
                            }} htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    fontSize: '18px'
                                }}>lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        padding: '0 40px 0 40px',
                                        fontSize: '14px',
                                        color: '#0e121b',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        padding: '0 12px',
                                        color: '#4d6599',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#2463eb'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#4d6599'}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            <div style={{ display: 'flex', gap: '4px', height: '3px', width: '100%', marginTop: '6px' }}>
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: '100%',
                                            width: '25%',
                                            borderRadius: '9999px',
                                            backgroundColor: i < passwordStrength
                                                ? (passwordStrength === 1 ? '#ef4444' : passwordStrength === 2 ? '#2463eb' : passwordStrength === 3 ? '#2463eb' : '#22c55e')
                                                : (i < 2 ? 'rgba(36, 99, 235, 0.3)' : '#e5e7eb'),
                                            transition: 'background-color 0.2s'
                                        }}
                                    ></div>
                                ))}
                            </div>
                            <p style={{ fontSize: '11px', color: '#4d6599', marginTop: '2px' }}>
                                Strength: <span style={{
                                    fontWeight: 600,
                                    color: passwordStrength >= 3 ? '#22c55e' : '#2463eb'
                                }}>
                                    {formData.password ? strengthLabels[passwordStrength - 1] || 'Weak' : 'Medium'}
                                </span>
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{
                                color: '#0e121b',
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.025em'
                            }} htmlFor="confirmPassword">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    fontSize: '18px'
                                }}>lock</span>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        padding: '0 40px 0 40px',
                                        fontSize: '14px',
                                        color: '#0e121b',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        padding: '0 12px',
                                        color: '#4d6599',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#2463eb'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#4d6599'}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.agreeTerms}
                                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    marginTop: '2px',
                                    borderRadius: '3px',
                                    border: '1px solid #d1d5db',
                                    cursor: 'pointer',
                                    accentColor: '#2463eb'
                                }}
                            />
                            <label style={{ fontSize: '13px', color: '#4d6599', lineHeight: '1.4' }} htmlFor="terms">
                                I agree to the <a href="#" style={{ color: '#0e121b', textDecoration: 'underline' }}>Terms of Service</a> and <a href="#" style={{ color: '#0e121b', textDecoration: 'underline' }}>Privacy Policy</a>.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: '6px',
                                display: 'flex',
                                height: '42px',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                backgroundColor: isLoading ? '#93c5fd' : '#2463eb',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                letterSpacing: '0.015em',
                                border: 'none',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(36,99,235,0.25)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#2463eb';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ position: 'relative', display: 'flex', padding: '4px 0', alignItems: 'center' }}>
                        <div style={{ flexGrow: 1, borderTop: '1px solid #e5e7eb' }}></div>
                        <span style={{
                            flexShrink: 0,
                            margin: '0 12px',
                            fontSize: '13px',
                            color: '#4d6599',
                            fontWeight: 500,
                            backgroundColor: '#F8F9FA',
                            padding: '0 4px'
                        }}>Or register with</span>
                        <div style={{ flexGrow: 1, borderTop: '1px solid #e5e7eb' }}></div>
                    </div>

                    {/* Social Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                height: '42px',
                                padding: '0 16px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: '#0e121b',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>Google</span>
                        </button>
                        <button
                            type="button"
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                height: '42px',
                                padding: '0 16px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: '#0e121b',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <svg aria-hidden="true" style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 24 24">
                                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
                            </svg>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>GitHub</span>
                        </button>
                    </div>

                    {/* Safe & Secure Badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        paddingTop: '12px',
                        opacity: 0.6
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#4d6599' }}>lock</span>
                        <span style={{ fontSize: '11px', color: '#4d6599', fontWeight: 500 }}>Secured by Industry Standard Encryption</span>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
                
                input::placeholder {
                    color: rgba(77, 101, 153, 0.5);
                }
                
                input:focus {
                    border-color: #2463eb !important;
                    box-shadow: 0 0 0 1px #2463eb !important;
                }
                
                ::selection {
                    background-color: rgba(36, 99, 235, 0.2);
                    color: #2463eb;
                }
                
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default RegisterPage;
