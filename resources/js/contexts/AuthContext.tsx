import api, { getAuthUser, setAuthToken, setAuthUser } from '@/utils/api';
import axios from 'axios';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    profile_photo_path?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        const loadUser = async () => {
            const savedToken = localStorage.getItem('auth_token');
            const savedUser = getAuthUser();

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(savedUser);
                setAuthToken(savedToken);
            }

            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(
                '/login',
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            const { token, user } = response.data;

            if (token && user) {
                setToken(token);
                setUser(user);
                setAuthToken(token);
                setAuthUser(user);
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            setAuthUser(updatedUser);
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
