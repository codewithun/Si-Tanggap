import axios from 'axios';

// Configure axios for Laravel Sanctum
const baseURL = import.meta.env.VITE_API_URL || '';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add CSRF token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

export default axiosInstance;
