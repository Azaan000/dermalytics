import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
);

const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://127.0.0.1:8000/api/v1' : '/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  }
});

// Helper to resolve static asset / upload URLs from Railway backend
export const getBackendAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : (isLocal ? 'http://127.0.0.1:8000' : '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dermalytics_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/auth')) {
        localStorage.removeItem('dermalytics_token');
        localStorage.removeItem('dermalytics_user');
      }
    }
    return Promise.reject(error);
  }
);
