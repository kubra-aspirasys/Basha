import axios from 'axios';
import { toast } from 'sonner';

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


let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Check if we are already on the login page to avoid multiple messages
            // Also check if we are already redirecting to avoid multiple toasts/logouts
            if (!window.location.pathname.includes('/login') && !isRedirecting) {
                isRedirecting = true;
                
                toast.error('Session Expired', {
                    description: 'Your session has expired. Please log in again to continue.',
                    duration: 4000,
                });

                // Clear the auth storage and state
                try {
                    // Lazy load to avoid circular dependency
                    const { useAuthStore } = await import('../store/auth-store');
                    useAuthStore.getState().logout();
                } catch (e) {
                    console.error('Failed to logout:', e);
                    localStorage.removeItem('auth-storage');
                    window.location.reload(); // Fallback
                }

                // Redirect to login after a short delay so the user can see the message
                // Note: calling logout() might trigger a state change that causes a redirect 
                // in ProtectedRoute even before this timeout expires.
                setTimeout(() => {
                    const isAdminPath = window.location.pathname.startsWith('/admin');
                    window.location.href = isAdminPath ? '/admin/login' : '/login';
                    
                    // Reset flag after redirect (though the whole app reloads)
                    setTimeout(() => { isRedirecting = false; }, 1000);
                }, 1500);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
