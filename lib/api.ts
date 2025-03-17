import axios from 'axios';
import { API_CONFIG } from '@/app/config';
import supabase from './supabase';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
    try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // If we have a session, add the token to the request
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        
        return config;
    } catch (error) {
        console.error('Error adding auth token:', error);
        return config;
    }
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized error (e.g., redirect to login)
            console.error('Unauthorized access');
        }
        return Promise.reject(error);
    }
);

export default api; 