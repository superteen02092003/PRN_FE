import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/Home/index';
import { RegisterPage, LoginPage } from './pages/Auth';
import ComponentsPage from './pages/Components';

function App() {
    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/components" element={<ComponentsPage />} />
                {/* Add more routes here */}
            </Routes>
        </div>
    );
}

export default App
