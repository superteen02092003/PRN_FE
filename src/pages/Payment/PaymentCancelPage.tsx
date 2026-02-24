import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './PaymentPages.css';

const PaymentCancelPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <>
            <Header />
            <div className="payment-page-wrapper">
                <div className="payment-result-card">
                    {/* Icon */}
                    <div className="payment-icon-wrapper">
                        <div className="payment-icon-circle payment-icon-circle--cancel">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="payment-heading">
                        <h1>Payment Cancelled</h1>
                        <p>
                            You have cancelled the payment process.
                            <br />
                            Your order is still saved and you can pay again at any time.
                        </p>
                    </div>

                    {/* Warning Note */}
                    <div className="payment-warning-box">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>
                            <strong>Note:</strong> Your order will automatically expire if payment is not completed within the specified time.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="payment-actions">
                        {orderId ? (
                            <Link to={`/orders/${orderId}`} className="payment-btn-primary payment-btn-primary--amber">
                                View Orders
                            </Link>
                        ) : (
                            <Link to="/orders" className="payment-btn-primary payment-btn-primary--amber">
                                View Orders
                            </Link>
                        )}
                        <Link to="/" className="payment-btn-secondary">
                            Back to Home
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

export default PaymentCancelPage;
