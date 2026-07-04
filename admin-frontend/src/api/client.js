import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeRequests = 0;

const handleLoading = (isLoading) => {
  if (isLoading) {
    activeRequests++;
    if (activeRequests === 1) {
      window.dispatchEvent(new Event('show-global-loader'));
    }
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
      window.dispatchEvent(new Event('hide-global-loader'));
    }
  }
};

client.interceptors.request.use((config) => {
  handleLoading(true);
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    handleLoading(false);
    return response;
  },
  async (error) => {
    handleLoading(false);
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
