import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/Home/index';

function App() {
    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} />

            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Add more routes here */}
            </Routes>
        </div>
    );
}

export default App
