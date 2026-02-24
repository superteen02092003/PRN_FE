import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './PaymentPages.css';

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const method = searchParams.get('method') || 'SEPAY';
    const totalAmount = searchParams.get('totalAmount');

    return (
        <>
            <Header />
            <div className="payment-page-wrapper">
                <div className="payment-result-card">
                    {/* Icon */}
                    <div className="payment-icon-wrapper">
                        <div className="payment-icon-circle payment-icon-circle--success">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="payment-heading">
                        <h1>{method === 'COD' ? 'Order Placed Successfully!' : 'Payment Successful!'}</h1>
                        <p>
                            {method === 'COD'
                                ? 'Your order has been recorded. You will pay upon delivery (COD).'
                                : 'Your payment has been confirmed. Your order is now being processed.'
                            }
                        </p>
                    </div>

                    {/* Summary Box */}
                    <div className="payment-summary-box">
                        {orderNumber && (
                            <div className="payment-summary-row">
                                <span className="payment-summary-row__label">Order Number</span>
                                <span className="payment-summary-row__value payment-summary-row__value--primary">{orderNumber}</span>
                            </div>
                        )}
                        {totalAmount && (
                            <div className="payment-summary-row">
                                <span className="payment-summary-row__label">Total Amount</span>
                                <span className="payment-summary-row__value payment-summary-row__value--bold">{formatPrice(Number(totalAmount))}</span>
                            </div>
                        )}
                        <div className="payment-summary-row">
                            <span className="payment-summary-row__label">Payment Method</span>
                            <span className="payment-summary-row__value">
                                {method === 'COD' ? 'Cash on Delivery' : 'SePay Online'}
                            </span>
                        </div>
                        <div className="payment-summary-row">
                            <span className="payment-summary-row__label">Status</span>
                            <div className="payment-status-indicator">
                                <span className={`payment-status-dot ${method === 'COD' ? 'payment-status-dot--orange' : 'payment-status-dot--green'}`} />
                                <span className="payment-summary-row__value">
                                    {method === 'COD' ? 'Pending Confirmation' : 'Paid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="payment-actions">
                        {orderId && (
                            <Link to={`/orders/${orderId}`} className="payment-btn-primary payment-btn-primary--blue">
                                View Order Details
                            </Link>
                        )}
                        <Link to="/products" className="payment-btn-secondary">
                            Continue Shopping
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

export default PaymentSuccessPage;
