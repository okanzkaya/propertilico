import axios from 'axios';
import { refreshToken } from './api';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

const getRefreshToken = () => localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

const handleCommonErrors = (error) => {
  const errorMessages = {
    401: 'Unauthorized access',
    403: 'Forbidden access',
    404: 'Resource not found',
    500: 'Internal server error',
  };
  const status = error.response?.status;
  console.error(errorMessages[status] || `An error occurred: ${error.message}`);
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    handleCommonErrors(error);

    if (error.response?.status === 403 && error.response.data.redirect === '/my-plan') {
      window.location.href = '/my-plan';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry 
        && !originalRequest.url.includes('/login') && !originalRequest.url.includes('/refresh-token')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const oldRefreshToken = getRefreshToken();
        if (!oldRefreshToken) throw new Error('No refresh token available');

        const { token, refreshToken: newRefreshToken } = await refreshToken(oldRefreshToken);
        
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('refreshToken', newRefreshToken);
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        processQueue(null, token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        [localStorage, sessionStorage].forEach(storage => {
          storage.removeItem('token');
          storage.removeItem('refreshToken');
        });
        delete axiosInstance.defaults.headers.common['Authorization'];
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;