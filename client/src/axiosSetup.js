import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: { 
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 30000,
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
  console.error(`API Error (${status}):`, errorMessages[status] || error.message);
  return error;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length']
    });
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;