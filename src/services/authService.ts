import api from './api';

// Types
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
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
    accessToken: string;
    expiresIn?: number;
}

export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
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
    register: async (data: RegisterRequest): Promise<string> => {
        const response = await api.post<string>('/users/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponseData> => {
        const response = await api.post<AuthResponseData>('/users/login', data);
        return response.data;
    },

    googleLogin: async (code: string, redirectUri: string): Promise<AuthResponseData> => {
        const response = await api.post<AuthResponseData>('/auth/google', { code, redirectUri });
        return response.data;
    },

    githubLogin: async (code: string, redirectUri: string): Promise<AuthResponseData> => {
        const response = await api.post<AuthResponseData>('/auth/github', { code, redirectUri });
        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
        try {
            const response = await api.get<any>(`/users/me`);
            const data = response.data;
            return {
                success: true,
                message: 'OK',
                data: {
                    userId: data.id,
                    username: data.username,
                    email: data.email,
                    role: data.role,
                    phone: data.phone,
                    address: data.address,
                    avatarUrl: data.avatarUrl,
                    createdAt: data.createdAt
                }
            };
        } catch {
            // Fallback to old endpoint
            const storedUser = authService.getStoredUser();
            if (!storedUser?.userId) {
                return { success: false, message: 'No user ID found' };
            }
            const response = await api.get<any>(`/users/${storedUser.userId}`);
            const data = response.data;
            return {
                success: true,
                message: 'OK',
                data: {
                    userId: data.userId,
                    username: data.username,
                    email: data.email,
                    role: data.roleName || data.role,
                    phone: data.phone,
                    address: data.address,
                    avatarUrl: data.avatarUrl,
                    createdAt: data.createdAt
                }
            };
        }
    },

    updateProfile: async (userId: number, data: { email: string; phone?: string; address?: string }): Promise<string> => {
        const response = await api.put<string>(`/users/${userId}`, data);
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

    uploadAvatar: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('files', file);
        const response = await api.post<{ success: boolean; data: { avatarUrl: string }; message: string }>(
            '/users/me/avatar',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to upload avatar');
        }
        return response.data.data.avatarUrl;
    },
};

export default authService;
