import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './PaymentPages.css';

const PaymentExpiredPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');

    return (
        <>
            <Header />
            <div className="payment-page-wrapper">
                <div className="payment-result-card">
                    {/* Icon */}
                    <div className="payment-icon-wrapper">
                        <div className="payment-icon-circle payment-icon-circle--warning">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="payment-heading">
                        <h1>Payment Session Expired</h1>
                        <p>Your payment window has closed. Don't worry, your order has been automatically cancelled.</p>
                    </div>

                    {/* Order Info */}
                    {orderNumber && (
                        <div className="payment-summary-box">
                            <div className="payment-summary-row">
                                <span className="payment-summary-row__label">Order Number</span>
                                <span className="payment-summary-row__value payment-summary-row__value--muted">{orderNumber}</span>
                            </div>
                            <div className="payment-summary-row">
                                <span className="payment-summary-row__label">Status</span>
                                <span className="payment-summary-row__value" style={{ color: '#f59e0b', fontWeight: 600 }}>CANCELLED</span>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="payment-info-box payment-info-box--warning">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <div>
                            <div className="payment-info-box__title">What happened?</div>
                            <ul className="payment-info-box__list">
                                <li>Payment was not completed within the time limit (10 minutes)</li>
                                <li>Your order has been automatically cancelled</li>
                                <li>Product stock has been restored</li>
                                <li>Any applied coupon has been returned to your account</li>
                            </ul>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="payment-actions">
                        <Link to="/products" className="payment-btn-primary">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                            Continue Shopping
                        </Link>
                        {orderId && (
                            <Link to={`/orders/${orderId}`} className="payment-btn-secondary">
                                View Order Details
                            </Link>
                        )}
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

export default PaymentExpiredPage;
