import axios from 'axios';

// In dev: use relative /api so Vite proxy handles all requests (no CORS)
// In production: use the full deployed BE URL
const baseURL = import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_URL || '/api');

const api = axios.create({
    baseURL: baseURL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect on login/register failures - let the page handle the error
            const url = error.config?.url || '';
            if (!url.includes('/login') && !url.includes('/register')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
