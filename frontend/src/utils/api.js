import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let resolvedApiOrigin = '';

function setResolvedApiOrigin(url) {
  if (!url) return;

  try {
    resolvedApiOrigin = new URL(url).origin;
  } catch {
    // ignore invalid URLs
  }
}

function originFromApiBaseUrl(baseUrl) {
  if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
    return '';
  }

  try {
    return new URL(baseUrl).origin;
  } catch {
    return '';
  }
}

setResolvedApiOrigin(originFromApiBaseUrl(API_BASE_URL));

export function getApiOrigin() {
  return originFromApiBaseUrl(API_BASE_URL) || resolvedApiOrigin;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized) - only redirect if user is authenticated
api.interceptors.response.use(
  (response) => {
    setResolvedApiOrigin(response.request?.responseURL);
    return response;
  },
  (error) => {
    // Only redirect on auth errors if user was previously authenticated
    // Don't redirect for public routes (like /api/categories or /api/complaints POST)
    const currentPath = window.location.pathname;
    const isPublicRoute = currentPath === '/' || currentPath.includes('/login');
    const isPublicAPI = error.config?.url?.includes('/categories') || 
                       (error.config?.url?.includes('/complaints') && error.config?.method === 'post');
    
    if ((error.response?.status === 401 || error.response?.status === 403) && 
        localStorage.getItem('token') && 
        !isPublicRoute && 
        !isPublicAPI) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to department login if it's a department route
      if (currentPath.includes('/dashboard')) {
        window.location.href = '/login/department';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
