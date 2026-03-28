import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { UserProfile, LoginRequest, AuthResponseData } from '../services/authService';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<AuthResponseData>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    oauthLogin: (response: AuthResponseData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        const token = authService.getToken();
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.getProfile();
            if (response.success && response.data) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            } else {
                // Token invalid, clear auth
                authService.logout();
                setUser(null);
            }
        } catch {
            // API error, try to use stored user
            const storedUser = authService.getStoredUser();
            setUser(storedUser);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: LoginRequest): Promise<AuthResponseData> => {
        const response = await authService.login(data);

        // Response is now directly AuthResponseData
        localStorage.setItem('token', response.accessToken);
        const userProfile: UserProfile = {
            userId: response.userId,
            username: response.username,
            email: response.email,
            role: response.role,
        };
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        window.dispatchEvent(new Event('authChange'));

        return response;
    };

    const oauthLogin = (response: AuthResponseData) => {
        localStorage.setItem('token', response.accessToken);
        const userProfile: UserProfile = {
            userId: response.userId,
            username: response.username,
            email: response.email,
            role: response.role,
        };
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        window.dispatchEvent(new Event('authChange'));
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    useEffect(() => {
        refreshUser();

        // Listen for auth changes from other tabs
        const handleAuthChange = () => {
            const storedUser = authService.getStoredUser();
            setUser(storedUser);
        };

        window.addEventListener('authChange', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);

        return () => {
            window.removeEventListener('authChange', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            refreshUser,
            oauthLogin,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
