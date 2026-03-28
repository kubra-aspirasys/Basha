import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// This will be set by auth-store after it initializes
let getAuthToken: (() => string | null) | null = null;

export const setAuthTokenGetter = (getter: () => string | null) => {
    getAuthToken = getter;
};

api.interceptors.request.use(
    (config) => {
        let token: string | null = null;

        // Primary: read directly from zustand store's in-memory state (always fresh)
        if (getAuthToken) {
            token = getAuthToken();
        }

        // Fallback: read from localStorage (for initial page load before store init)
        if (!token) {
            try {
                const storageStr = localStorage.getItem('auth-storage');
                if (storageStr) {
                    const storage = JSON.parse(storageStr);
                    token = storage.state?.token || null;
                }
            } catch (err) {
                console.error('Error parsing auth-storage', err);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
        }
        return Promise.reject(error);
    }
);

export default api;
