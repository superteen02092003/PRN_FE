import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/Home/index';
import { RegisterPage, LoginPage } from './pages/Auth';
import ProductsPage from './pages/Products';
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

                        {/* Add more routes here */}
                    </Routes>
                </AnimatePresence>
            </div>
        </AuthProvider>
    );
}

export default App

