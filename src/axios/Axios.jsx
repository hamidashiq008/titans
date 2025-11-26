import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/AuthSlice';
// Create axios instance with base URL
const instance = axios.create({
    baseURL: 'https://titans-laravel.edexceledu.com/api',
    // baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to add auth token
instance.interceptors.request.use(
    (config) => {
        const token = store.getState()?.auth?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
              store.dispatch(logout());
            // window.location.href = '/auth/sign-in';
        }
        return Promise.reject(error);
    }
);

export default instance;