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
};

export default authService;
