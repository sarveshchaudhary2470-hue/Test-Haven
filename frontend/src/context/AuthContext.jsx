import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from '../utils/toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Logout function
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    // Configure axios defaults and interceptors
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }

        // Add response interceptor for handling 401 errors (token expiry)
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    console.log('Token expired or invalid, logging out...');
                    logout();

                    // Show user-friendly message
                    if (error.response?.data?.message?.includes('expired')) {
                        toast.error('⏰ Your session has expired. Please login again.');
                    } else if (error.response?.data?.message?.includes('token')) {
                        toast.error('🔒 Authentication failed. Please login again.');
                    }

                    // Redirect to login
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [token]);

    // Check token expiry periodically
    useEffect(() => {
        if (!token) return;

        const checkTokenExpiry = () => {
            try {
                // Decode JWT token (simple base64 decode)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeUntilExpiry = expiryTime - currentTime;

                // If token expires in less than 5 minutes, warn user
                if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
                    console.warn('Token expiring soon...');
                }

                // If token is expired, logout
                if (timeUntilExpiry <= 0) {
                    console.log('Token expired, logging out...');
                    toast.warning('⏰ Your session has expired. Please login again.');
                    logout();
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Error checking token expiry:', error);
            }
        };

        // Check immediately
        checkTokenExpiry();

        // Check every minute
        const interval = setInterval(checkTokenExpiry, 60 * 1000);

        return () => clearInterval(interval);
    }, [token]);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const { data } = await axios.get('http://localhost:5000/api/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    // Don't logout here, let the interceptor handle it
                    if (error.response?.status !== 401) {
                        setToken(null);
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            setToken(data.token);
            setUser(data);
            return { success: true, user: data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isPrincipal: user?.role === 'principal',
        isStudent: user?.role === 'student',
        isTeacher: user?.role === 'teacher',
        isManager: user?.role === 'manager'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
