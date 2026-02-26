import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCheckout } from '../../hooks/useCheckout';
import ShippingForm from '../../components/checkout/ShippingForm';
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector';
import OrderReview from '../../components/checkout/OrderReview';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const initialCoupon = searchParams.get('coupon') || undefined;

    const {
        paymentMethods,
        checkoutValidation,
        formData,
        formErrors,
        selectedPaymentMethod,
        isLoading,
        isSubmitting,
        isValidating,
        error,
        setFormField,
        setSelectedPaymentMethod,
        handleSubmit,
    } = useCheckout(initialCoupon);

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="checkout-page-wrapper">
                    <div className="checkout-loading">
                        <div className="checkout-loading-spinner" />
                        <p className="checkout-loading-text">Loading checkout information...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error && !checkoutValidation) {
        return (
            <>
                <Header />
                <div className="checkout-page-wrapper">
                    <div className="checkout-error-state">
                        <div className="checkout-error-icon">
                            <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h2 className="checkout-error-title">Unable to load checkout</h2>
                        <p className="checkout-error-message">{error}</p>
                        <Link to="/cart" className="checkout-error-link">
                            ← Back to Cart
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="checkout-page-wrapper">
                {/* Breadcrumb */}
                <div className="checkout-breadcrumb">
                    <Link to="/" className="checkout-breadcrumb-link">Store</Link>
                    <span className="checkout-breadcrumb-sep">/</span>
                    <Link to="/cart" className="checkout-breadcrumb-link">Cart</Link>
                    <span className="checkout-breadcrumb-sep">/</span>
                    <span className="checkout-breadcrumb-current">Checkout</span>
                </div>

                {/* Page Title */}
                <motion.h1
                    className="checkout-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Precision Checkout
                </motion.h1>
                <p className="checkout-subtitle">Complete your order for professional-grade robotics hardware.</p>

                {/* Main Content */}
                <div className="checkout-content">
                    {/* Left Column - Forms */}
                    <motion.div
                        className="checkout-left"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* Shipping Form Card */}
                        <div className="checkout-card">
                            <ShippingForm
                                formData={formData}
                                formErrors={formErrors}
                                onFieldChange={setFormField}
                                isLoading={isSubmitting}
                            />
                        </div>

                        {/* Payment Method Card */}
                        <div className="checkout-card">
                            <PaymentMethodSelector
                                methods={paymentMethods}
                                selected={selectedPaymentMethod}
                                onSelect={setSelectedPaymentMethod}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </motion.div>

                    {/* Right Column - Order Review (Sticky) */}
                    <motion.div
                        className="checkout-right"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="checkout-card checkout-sticky">
                            <OrderReview
                                validation={checkoutValidation}
                                isValidating={isValidating}
                                isSubmitting={isSubmitting}
                                onSubmit={handleSubmit}
                                paymentMethod={selectedPaymentMethod}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage;
