import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 30000,
});

const refreshTokenEndpoint = '/api/auth/refresh-token';

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper functions
const getRefreshToken = () => localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new ApiError({
        ...error,
        message: 'Network error: Please check your connection'
      }));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === refreshTokenEndpoint) {
        // Clear auth data and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/signin';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If a token refresh is already in progress, queue this request
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axiosInstance.post(refreshTokenEndpoint, { refreshToken });
        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Update stored tokens
        const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
        storage.setItem('token', newToken);
        storage.setItem('refreshToken', newRefreshToken);

        // Update axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Process any queued requests
        processQueue(null, newToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear auth data and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const handledError = handleCommonErrors(error);
    return Promise.reject(new ApiError({
      ...error,
      message: handledError.message
    }));
  }
);

export default axiosInstance;