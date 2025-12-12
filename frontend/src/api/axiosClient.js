import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401 && message === 'Invalid or expired token') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        if (!currentPath.startsWith('/login')) {
          window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
