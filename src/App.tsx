import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/Home/index';
import { RegisterPage, LoginPage } from './pages/Auth';
import ProductsPage from './pages/Products';
import ProductDetailPage from './pages/Products/ProductDetail';
import { CartPage } from './pages/Cart';
import { CheckoutPage } from './pages/Checkout';
import { PaymentSuccessPage, PaymentErrorPage, PaymentCancelPage, PaymentPendingPage } from './pages/Payment';
import { OrderHistoryPage, OrderDetailPage } from './pages/Orders';
import PageTransition from './components/common/PageTransition';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AdminDashboard } from './pages/Admin';
import ProfilePage from './pages/Profile';

function App() {
    const location = useLocation();

    return (
        <AuthProvider>
            <div>
                <ToastContainer position="top-right" autoClose={5000} />

                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={
                            <PageTransition>
                                <HomePage />
                            </PageTransition>
                        } />
                        <Route path="/register" element={
                            <PageTransition>
                                <RegisterPage />
                            </PageTransition>
                        } />
                        <Route path="/login" element={
                            <PageTransition>
                                <LoginPage />
                            </PageTransition>
                        } />
                        <Route path="/products" element={
                            <PageTransition>
                                <ProductsPage />
                            </PageTransition>
                        } />
                        <Route path="/products/:id" element={
                            <PageTransition>
                                <ProductDetailPage />
                            </PageTransition>
                        } />

                        {/* Protected Cart Route */}
                        <Route path="/cart" element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <CartPage />
                                </PageTransition>
                            </ProtectedRoute>
                        } />

                        {/* Protected Checkout Route */}
                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <CheckoutPage />
                                </PageTransition>
                            </ProtectedRoute>
                        } />

                        {/* Payment Result Pages */}
                        <Route path="/payment/success" element={
                            <PageTransition>
                                <PaymentSuccessPage />
                            </PageTransition>
                        } />
                        <Route path="/payment/error" element={
                            <PageTransition>
                                <PaymentErrorPage />
                            </PageTransition>
                        } />
                        <Route path="/payment/cancel" element={
                            <PageTransition>
                                <PaymentCancelPage />
                            </PageTransition>
                        } />
                        <Route path="/payment/pending/:orderId" element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <PaymentPendingPage />
                                </PageTransition>
                            </ProtectedRoute>
                        } />

                        {/* Protected Order Routes */}
                        <Route path="/orders" element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <OrderHistoryPage />
                                </PageTransition>
                            </ProtectedRoute>
                        } />
                        <Route path="/orders/:id" element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <OrderDetailPage />
                                </PageTransition>
                            </ProtectedRoute>
                        } />

                        {/* Protected Profile Route - All authenticated users */}
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <ProfilePage />
                                </PageTransition>
                            </ProtectedRoute>
                        } />

                        {/* Protected Admin Routes */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <PageTransition>
                                    <AdminDashboard />
                                </PageTransition>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </AnimatePresence>
            </div>
        </AuthProvider>
    );
}

export default App



