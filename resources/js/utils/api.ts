import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// Add a request interceptor to include token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage if it exists
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 errors
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Redirect to login page if needed
            // window.location.href = '/login';
        }

        return Promise.reject(error);
    },
);

export const setAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
};

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    // Add other user properties as needed
}

export const setAuthUser = (user: AuthUser | null) => {
    if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('auth_user');
    }
};

export const getAuthUser = () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
};

export const logout = async () => {
    try {
        await api.post('/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
    }
};

export default api;
