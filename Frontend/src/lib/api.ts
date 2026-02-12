import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Zustand persist stores data in localStorage with key 'auth-storage'
        const storageStr = localStorage.getItem('auth-storage');
        if (storageStr) {
            try {
                const storage = JSON.parse(storageStr);
                const token = storage.state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (err) {
                console.error('Error parsing auth-storage', err);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - maybe logout or redirect
            // localStorage.removeItem('auth-storage');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
