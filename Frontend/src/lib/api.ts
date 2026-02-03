import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Zustand persist stores data in localStorage with key 'auth-storage'
        // TEMPORARY: Hardcoded Dev Token (Admin)
        const devToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI1M2M1OGMwLTliNDItNDExZi1iYjYyLTY5MTQ0NzQxYjZhZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MDEyMTExMSwiZXhwIjoxNzc4NzYxMTExfQ.ODlqNgkNTOrMC_JSOAz4wpWxeXuxFCBPHiLSMYFUYfg';
        config.headers.Authorization = `Bearer ${devToken}`;

        // Original logic commented out for now
        /*
        const storageStr = localStorage.getItem('auth-storage');
        if (storageStr) {
            const storage = JSON.parse(storageStr);
            const token = storage.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        */
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
