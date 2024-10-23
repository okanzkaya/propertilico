import axios from 'axios';

<<<<<<< HEAD
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: { 
=======
// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
>>>>>>> master
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 30000,
});

<<<<<<< HEAD
let isRefreshing = false;
let failedQueue = [];

=======
// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
>>>>>>> master
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

<<<<<<< HEAD
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
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response: ${response.status} ${response.config.url}`);
=======
// Helper functions
const getRefreshToken = () => localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
const getAccessToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

const handleCommonErrors = (error) => {
  const errorMessages = {
    400: 'Bad request',
    401: 'Unauthorized access',
    403: 'Forbidden access',
    404: 'Resource not found',
    408: 'Request timeout',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
    504: 'Gateway timeout'
  };

  const status = error.response?.status;
  const errorMessage = errorMessages[status] || error.message;
  
  console.error('API Error:', {
    status,
    message: errorMessage,
    url: error.config?.url,
    method: error.config?.method,
    data: error.config?.data
  });

  return {
    status,
    message: errorMessage,
    originalError: error
  };
};

// Custom error class for API errors
class ApiError extends Error {
  constructor(error) {
    super(error.message);
    this.name = 'ApiError';
    this.status = error.response?.status;
    this.data = error.response?.data;
    this.config = error.config;
  }
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        responseType: config.responseType,
        headers: config.headers
      });
    }

    // Add auth token if available
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Handle specific response types
    if (config.url?.includes('/preview') || config.url?.includes('/download')) {
      config.responseType = 'arraybuffer';
      config.headers['Accept'] = 'image/jpeg,image/png,image/svg+xml,application/pdf,*/*';
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(new ApiError(error));
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses
    const responseInfo = {
      url: response.config.url,
      status: response.status,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
      responseType: response.config.responseType
    };

    // Add data type info for non-binary responses
    if (!response.config.responseType || response.config.responseType === 'json') {
      responseInfo.dataType = response.data?.constructor.name;
    }

    console.log('Response:', responseInfo);

>>>>>>> master
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
<<<<<<< HEAD
    handleCommonErrors(error);

    if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
      console.log('Request timed out, retrying...');
      originalRequest._retry = true;
      return axiosInstance(originalRequest);
    }

    if (error.response?.status === 403 && error.response.data.redirect === '/my-plan') {
      console.log('Redirecting to subscription plan page');
      window.location.href = '/my-plan';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry 
        && !originalRequest.url.includes('/login') && !originalRequest.url.includes('/refresh-token')) {
      if (isRefreshing) {
=======
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new ApiError({
        ...error,
        message: 'Network error: Please check your connection'
      }));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      if (originalRequest.url.includes('auth/refresh-token')) {
        console.log('Refresh token failed, redirecting to login');
        window.location.href = '/signin';
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          console.log('No refresh token available, redirecting to login');
          window.location.href = '/signin';
          return Promise.reject(error);
        }

        try {
          console.log('Attempting to refresh token');
          const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });
          const { token: newToken } = response.data;

          // Update stored token
          const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
          storage.setItem('token', newToken);

          // Update request header
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Process queued requests
          processQueue(null, newToken);
          
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          window.location.href = '/signin';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Queue subsequent requests
>>>>>>> master
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
<<<<<<< HEAD
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const oldRefreshToken = getRefreshToken();
        if (!oldRefreshToken) throw new Error('No refresh token available');

        const response = await axiosInstance.post('/api/auth/refresh-token', { refreshToken: oldRefreshToken });
        const { token, refreshToken: newRefreshToken } = response.data;
        
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
        console.error('Token refresh failed, redirecting to signin');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
=======
        }).catch(err => {
          return Promise.reject(err);
        });
      }
    }

    // Handle other errors
    const handledError = handleCommonErrors(error);
    return Promise.reject(new ApiError({
      ...error,
      message: handledError.message
    }));
>>>>>>> master
  }
);

export default axiosInstance;