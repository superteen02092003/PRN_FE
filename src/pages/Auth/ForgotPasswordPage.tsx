import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

type Step = 'email' | 'otp';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setStep('otp');
            setResendCooldown(60);
        } catch {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setError(null);
        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setResendCooldown(60);
        } catch {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await authService.resetPassword(email, otp, newPassword);
            if (result.success) {
                navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' } });
            } else {
                setError(result.message || 'Mã OTP không đúng hoặc đã hết hạn.');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setError(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F8F9FA' }}>
            {/* Left hero panel */}
            <div style={{
                flex: 1, background: 'linear-gradient(135deg, #1a4fd4 0%, #2463eb 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', padding: '48px', color: 'white'
            }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px' }}>STEM Gear</h1>
                <p style={{ fontSize: 16, opacity: 0.85, textAlign: 'center', maxWidth: 280 }}>
                    Đặt lại mật khẩu an toàn qua mã OTP gửi về email của bạn.
                </p>
            </div>

            {/* Right form panel */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', padding: '48px'
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    {step === 'email' ? (
                        <>
                            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0e121b', marginBottom: 8 }}>
                                Quên mật khẩu
                            </h2>
                            <p style={{ color: '#4d6599', marginBottom: 32, fontSize: 14 }}>
                                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
                            </p>

                            {error && (
                                <div style={{
                                    background: '#fee2e2', border: '1px solid #fca5a5',
                                    borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                                    color: '#dc2626', fontSize: 14
                                }}>{error}</div>
                            )}

                            <form onSubmit={handleSendOtp}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0e121b', marginBottom: 6 }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="email@example.com"
                                    style={{
                                        width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
                                        borderRadius: 8, fontSize: 14, marginBottom: 24,
                                        boxSizing: 'border-box', outline: 'none'
                                    }}
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%', padding: '12px', background: '#2463eb',
                                        color: 'white', border: 'none', borderRadius: 8,
                                        fontSize: 15, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#4d6599' }}>
                                <Link to="/login" style={{ color: '#2463eb', fontWeight: 600, textDecoration: 'none' }}>
                                    ← Quay lại đăng nhập
                                </Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0e121b', marginBottom: 8 }}>
                                Đặt lại mật khẩu
                            </h2>
                            <p style={{ color: '#4d6599', marginBottom: 32, fontSize: 14 }}>
                                Mã OTP đã được gửi đến <strong>{email}</strong>. Kiểm tra hộp thư (kể cả thư rác).
                            </p>

                            {error && (
                                <div style={{
                                    background: '#fee2e2', border: '1px solid #fca5a5',
                                    borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                                    color: '#dc2626', fontSize: 14
                                }}>{error}</div>
                            )}

                            <form onSubmit={handleResetPassword}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0e121b', marginBottom: 6 }}>
                                    Mã OTP (6 số)
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                    placeholder="123456"
                                    style={{
                                        width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
                                        borderRadius: 8, fontSize: 20, letterSpacing: 8, textAlign: 'center',
                                        marginBottom: 20, boxSizing: 'border-box', outline: 'none'
                                    }}
                                />

                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0e121b', marginBottom: 6 }}>
                                    Mật khẩu mới
                                </label>
                                <div style={{ position: 'relative', marginBottom: 20 }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="Tối thiểu 6 ký tự"
                                        style={{
                                            width: '100%', padding: '10px 40px 10px 14px',
                                            border: '1.5px solid #d1d5db', borderRadius: 8,
                                            fontSize: 14, boxSizing: 'border-box', outline: 'none'
                                        }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(p => !p)}
                                        style={{
                                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#4d6599', fontSize: 12
                                        }}>
                                        {showPassword ? 'Ẩn' : 'Hiện'}
                                    </button>
                                </div>

                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0e121b', marginBottom: 6 }}>
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Nhập lại mật khẩu mới"
                                    style={{
                                        width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
                                        borderRadius: 8, fontSize: 14, marginBottom: 24,
                                        boxSizing: 'border-box', outline: 'none'
                                    }}
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    style={{
                                        width: '100%', padding: '12px', background: '#2463eb',
                                        color: 'white', border: 'none', borderRadius: 8,
                                        fontSize: 15, fontWeight: 600,
                                        cursor: (isLoading || otp.length < 6) ? 'not-allowed' : 'pointer',
                                        opacity: (isLoading || otp.length < 6) ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#4d6599' }}>
                                <span>Không nhận được mã? </span>
                                <button
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0 || isLoading}
                                    style={{
                                        background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                        color: resendCooldown > 0 ? '#9ca3af' : '#2463eb',
                                        fontWeight: 600, fontSize: 14, padding: 0
                                    }}
                                >
                                    {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại'}
                                </button>
                            </div>

                            <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14 }}>
                                <button
                                    onClick={() => { setStep('email'); setError(null); setOtp(''); }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#4d6599', fontSize: 14, textDecoration: 'underline'
                                    }}
                                >
                                    Dùng email khác
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
