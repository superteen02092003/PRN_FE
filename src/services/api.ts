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
            const currentToken = localStorage.getItem('token');
            const requestTokenHeader = error.config?.headers?.Authorization as string;
            const requestToken = requestTokenHeader ? requestTokenHeader.replace('Bearer ', '') : null;

            // Only log out and redirect if the token that failed 401 is the same as our current token.
            // If we just logged in and got a NEW token, ignore 401s from older requests in flight.
            const url = error.config?.url || '';
            const isAuthApi = url.includes('/login') || url.includes('/register') || url.includes('/auth/');
            const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register') || window.location.pathname.includes('/auth/');

            if (!isAuthApi && !isAuthPage && requestToken === currentToken) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
