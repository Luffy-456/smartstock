import axios from 'axios';

// Resolve API base URL:
// 1. User runtime override stored in localStorage
// 2. Vite environment variable injected at build time (VITE_API_BASE_URL)
// 3. Fallback: localhost for local dev, Render production endpoint for deployment
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('stocksmart_api_url');
    if (custom) return custom.replace(/\/+$/, '');
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://127.0.0.1:8000/api';
    }
  }

  return 'https://stocksmart-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60 seconds timeout to accommodate Render free tier cold-start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh / auth error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (!window.location.hash.includes('/login')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('stocksmart_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
