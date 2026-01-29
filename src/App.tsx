import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/Home/index';
import { RegisterPage, LoginPage } from './pages/Auth';
import ComponentsPage from './pages/Components';
import PageTransition from './components/common/PageTransition';

function App() {
    const location = useLocation();

    return (
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
                    <Route path="/components" element={
                        <PageTransition>
                            <ComponentsPage />
                        </PageTransition>
                    } />
                    {/* Add more routes here */}
                </Routes>
            </AnimatePresence>
        </div>
    );
}

export default App
