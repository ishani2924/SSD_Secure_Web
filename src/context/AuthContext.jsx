import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// Hook is colocated with provider; Vite fast refresh expects only components in this file.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

// VULNERABILITY 6: Sensitive Information in URL (Token Leakage) - FIXED: Now using httpOnly cookies instead of localStorage
// Cookies are handled automatically by the browser, preventing XSS-based token theft
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/auth/profile');
                setUser(res.data);

                // [Google OAuth] Clean up ?login=success from URL after Google callback redirect
                // The backend sets cookies and redirects here; we just tidy up the URL
                const params = new URLSearchParams(window.location.search);
                if (params.get('login') === 'success') {
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, '', cleanUrl);
                }
            } catch (err) {
                console.error('Auth verification failed', err);
                setUser(null);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // VULNERABILITY 6: Sensitive Information in URL (Token Leakage) - FIXED: No localStorage usage
    const login = async (email, password) => {
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    // VULNERABILITY 6: Sensitive Information in URL (Token Leakage) - FIXED: No localStorage usage
    const register = async (userData) => {
        setError(null);
        try {
            const res = await api.post('/auth/register', userData);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    // VULNERABILITY 6: Sensitive Information in URL (Token Leakage) - FIXED: Now using backend logout endpoint to clear cookies
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-text-muted">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-hidden />
                    <p className="text-sm">Checking session…</p>
                    <p className="text-xs text-text-muted/80 max-w-xs text-center px-4">
                        If this takes long, ensure the API is running and <code className="text-primary">VITE_API_BASE_URL</code> in{' '}
                        <code className="text-primary">.env</code> matches your backend.
                    </p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
