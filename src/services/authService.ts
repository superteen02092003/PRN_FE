import api from './api';

// Types
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    address: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponseData {
    userId: number;
    username: string;
    email: string;
    role: string;
    token: string;
    expiresIn?: number;
}

export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    createdAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// Auth Service
const authService = {
    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponseData>> => {
        const response = await api.post<ApiResponse<AuthResponseData>>('/Auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
        const response = await api.post<ApiResponse<AuthResponseData>>('/Auth/login', data);
        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
        const response = await api.get<ApiResponse<UserProfile>>('/Auth/profile');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
    },

    getStoredUser: (): UserProfile | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },
};

export default authService;
