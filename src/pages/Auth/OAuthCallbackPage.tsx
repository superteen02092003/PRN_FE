import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService, { AuthResponseData } from '../../services/authService';

const OAuthCallbackPage = () => {
    const [error, setError] = useState<string | null>(null);
    const { oauthLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const processOAuth = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state');

            if (!code) {
                setError('No authorization code found');
                return;
            }

            try {
                // Determine redirect URI - must match exactly what was sent in the original request
                const redirectUri = `${window.location.origin}/auth/callback`;
                let response: AuthResponseData;

                if (state === 'google') {
                    response = await authService.googleLogin(code, redirectUri);
                } else if (state === 'github') {
                    response = await authService.githubLogin(code, redirectUri);
                } else {
                    throw new Error('Invalid authentication state');
                }

                oauthLogin(response);
                
                // Redirect based on role
                if (response.role === 'Admin' || response.role === 'Staff') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (err: any) {
                console.error('OAuth login failed:', err);
                const errorMessage = err?.response?.data?.message || err.message || 'Authentication failed';
                
                if (errorMessage.includes('User not registered') || errorMessage.includes('register a new account')) {
                    navigate('/register', { 
                        state: { error: 'Bạn chưa đăng ký tài khoản này. Vui lòng tạo tài khoản mới!' },
                        replace: true 
                    });
                    return;
                }

                setError(errorMessage);
                // After 3 seconds, redirect back to login
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        processOAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Failed</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authenticating</h2>
                <p className="text-gray-600 dark:text-gray-400">Please wait while we log you in...</p>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;
