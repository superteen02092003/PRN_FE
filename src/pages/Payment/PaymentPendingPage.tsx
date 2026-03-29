import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { getOrderDetail } from '../../services/orderService';
import './PaymentPages.css';

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Fallback timeout = 10 minutes (matches backend AddMinutes(10)), used when expiredAt hasn't been fetched yet
const PAYMENT_TIMEOUT_SECONDS = 10 * 60;

const PaymentPendingPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');

    const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
    // initialTimeLeft used to calculate % progress bar - synced from backend
    const [initialTimeLeft, setInitialTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [paymentReference, setPaymentReference] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPaid, setIsPaid] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!orderId) return;
            try {
                const order = await getOrderDetail(Number(orderId));
                if (order.payment) {
                    setQrCodeUrl(order.payment.qrCodeUrl || null);
                    setTotalAmount(order.payment.amount || 0);
                    setPaymentReference(order.payment.paymentReference || '');
                    if (order.payment.expiredAt) {
                        const expiresAt = new Date(order.payment.expiredAt).getTime();
                        const now = Date.now();
                        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
                        setTimeLeft(remaining);
                        // Calculate total duration from expiredAt for accurate progress bar display
                        const totalDuration = Math.floor((expiresAt - (now - remaining * 1000)) / 1000);
                        setInitialTimeLeft(Math.max(totalDuration, remaining));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch order detail:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetail();
    }, [orderId]);

    // Poll for payment status
    const pollPaymentStatus = useCallback(async () => {
        if (!orderId) return;
        try {
            const order = await getOrderDetail(Number(orderId));
            if (order.payment?.status === 'COMPLETED') {
                setIsPaid(true);
                if (pollingRef.current) clearInterval(pollingRef.current);
                navigate(`/payment/success?status=success&orderId=${orderId}&orderNumber=${orderNumber}&method=SEPAY&totalAmount=${totalAmount}`);
            } else if (order.payment?.status === 'EXPIRED' || order.payment?.status === 'FAILED') {
                // Payment expired or failed - redirect to expired page
                if (pollingRef.current) clearInterval(pollingRef.current);
                navigate(`/payment/expired?orderId=${orderId}&orderNumber=${orderNumber}`);
            }
        } catch { /* silent */ }
    }, [orderId, orderNumber, totalAmount, navigate]);

    useEffect(() => {
        pollingRef.current = setInterval(pollPaymentStatus, 5000);
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [pollPaymentStatus]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0 || isPaid) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect to expired page instead of error page
                    navigate(`/payment/expired?orderId=${orderId}&orderNumber=${orderNumber}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isPaid, navigate, orderId, orderNumber]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = initialTimeLeft > 0 ? timeLeft / initialTimeLeft : 0;
    const strokeDashoffset = circumference * (1 - progress);

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="payment-page-wrapper">
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading payment details...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="payment-page-wrapper">
                <div className="payment-result-card">
                    {/* Countdown */}
                    <div className="payment-countdown-wrapper">
                        <div className="payment-countdown">
                            <svg viewBox="0 0 120 120">
                                <circle className="payment-countdown__track" cx="60" cy="60" r={radius} />
                                <circle
                                    className="payment-countdown__progress"
                                    cx="60" cy="60" r={radius}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                />
                            </svg>
                            <div className="payment-countdown__text">
                                <span className="payment-countdown__time">
                                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </span>
                                <span className="payment-countdown__label">remaining</span>
                            </div>
                        </div>
                    </div>

                    {/* Pulse Status */}
                    <div className="payment-pulse-status">
                        <span className="payment-pulse-dot">
                            <span className="payment-pulse-dot__ping" />
                            <span className="payment-pulse-dot__core" />
                        </span>
                        <span>Awaiting payment...</span>
                    </div>

                    {/* Heading */}
                    <div className="payment-heading">
                        <h1>Complete Payment</h1>
                        <p>Scan the QR code below with your banking app to complete payment.</p>
                    </div>

                    {/* Order Info */}
                    <div className="payment-summary-box">
                        {orderNumber && (
                            <div className="payment-summary-row">
                                <span className="payment-summary-row__label">Order Number</span>
                                <span className="payment-summary-row__value payment-summary-row__value--primary">{orderNumber}</span>
                            </div>
                        )}
                        <div className="payment-summary-row">
                            <span className="payment-summary-row__label">Amount</span>
                            <span className="payment-summary-row__value payment-summary-row__value--bold">{formatPrice(totalAmount)}</span>
                        </div>
                        {paymentReference && (
                            <div className="payment-summary-row">
                                <span className="payment-summary-row__label">Reference</span>
                                <span className="payment-summary-row__value" style={{ fontFamily: 'monospace' }}>{paymentReference}</span>
                            </div>
                        )}
                    </div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                        <div className="payment-qr-wrapper">
                            <div className="payment-qr-box">
                                <img src={qrCodeUrl} alt="Payment QR Code" />
                            </div>
                        </div>
                    )}

                    {/* Warning */}
                    <div className="payment-warning-box">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p>
                            <strong>Important:</strong> Do not close this page until payment is confirmed. The system automatically checks for your payment.
                        </p>
                    </div>

                    {/* Cancel Button */}
                    <div className="payment-actions">
                        <Link to={`/payment/cancel?orderId=${orderId}`} className="payment-btn-outline">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Payment
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="payment-security-footer">
                        <p>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            STEM GEAR SECURE SYSTEM
                        </p>
                    </div>
                </div>
            </div>
            <div className="payment-bottom-gradient" />
            <Footer />
        </>
    );
};

export default PaymentPendingPage;
