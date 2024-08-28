// src/axiosSetup.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const getRefreshToken = () => localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once to prevent infinite loops
    if (error.response.status === 401 && error.response.data.message === 'Token expired' && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // Handle missing refresh token scenario
        console.error('No refresh token available');
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          token: refreshToken,
        });

        // Store the new token and retry the original request
        localStorage.setItem('token', data.token);
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);

        // Clear tokens on refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');

        // Optionally, you can redirect to the login page here
        // window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
