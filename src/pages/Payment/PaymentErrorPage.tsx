import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './PaymentPages.css';

const PaymentErrorPage = () => {
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message') || 'An error occurred during the payment process.';
    const orderId = searchParams.get('orderId');

    return (
        <>
            <Header />
            <div className="payment-page-wrapper">
                <div className="payment-result-card">
                    {/* Icon */}
                    <div className="payment-icon-wrapper">
                        <div className="payment-icon-circle payment-icon-circle--error">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="payment-heading">
                        <h1>Payment Failed</h1>
                        <p>{message}</p>
                    </div>

                    {/* Error Reasons */}
                    <div className="payment-error-box">
                        <div className="payment-error-box__title">Possible reasons:</div>
                        <ul className="payment-error-box__list">
                            <li className="payment-error-box__item">
                                <span className="payment-error-box__dot" />
                                Insufficient account balance
                            </li>
                            <li className="payment-error-box__item">
                                <span className="payment-error-box__dot" />
                                Payment session has expired
                            </li>
                            <li className="payment-error-box__item">
                                <span className="payment-error-box__dot" />
                                Bank connection error
                            </li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="payment-actions">
                        {orderId && (
                            <Link to={`/orders/${orderId}`} className="payment-btn-primary payment-btn-primary--red">
                                Retry Payment
                            </Link>
                        )}
                        <Link to="/orders" className="payment-btn-secondary">
                            View Orders
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

export default PaymentErrorPage;
