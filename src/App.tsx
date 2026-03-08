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
import { AdminDashboard, AdminProductsPage, AdminProductFormPage, AdminOrdersPage, AdminOrderDetailPage, AdminUsersPage, AdminBrandsPage, AdminCategoriesPage, AdminReviewsPage, AdminWarrantyClaimsPage } from './pages/Admin';
import AdminChatPage from './pages/Admin/Chat/AdminChatPage';
import ProfilePage from './pages/Profile';
import MyWarrantiesPage from './pages/Warranties/MyWarrantiesPage';
import SubmitClaimPage from './pages/Warranties/SubmitClaimPage';
import ChatPage from './pages/Chat/ChatPage';
import StorePage from './pages/Store/StorePage';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
    const location = useLocation();

    return (
        <AuthProvider>
            <NotificationProvider>
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
                            <Route path="/store" element={
                                <PageTransition>
                                    <StorePage />
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

                            {/* Protected Warranty Routes */}
                            <Route path="/warranties" element={
                                <ProtectedRoute>
                                    <PageTransition>
                                        <MyWarrantiesPage />
                                    </PageTransition>
                                </ProtectedRoute>
                            } />
                            <Route path="/warranties/:warrantyId/claim" element={
                                <ProtectedRoute>
                                    <PageTransition>
                                        <SubmitClaimPage />
                                    </PageTransition>
                                </ProtectedRoute>
                            } />

                            {/* Protected Chat Route */}
                            <Route path="/chat" element={
                                <ProtectedRoute>
                                    <PageTransition>
                                        <ChatPage />
                                    </PageTransition>
                                </ProtectedRoute>
                            } />

                            {/* Protected Admin Routes */}
                            <Route path="/admin/dashboard" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/products" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminProductsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/products/new" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminProductFormPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/products/:id/edit" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminProductFormPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/orders" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminOrdersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/orders/:id" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminOrderDetailPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/users" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminUsersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/brands" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminBrandsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/categories" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminCategoriesPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/reviews" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminReviewsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/warranty-claims" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminWarrantyClaimsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/chat" element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminChatPage />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </AnimatePresence>
                </div>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App



