import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { loginUser, registerUser, userApi, authApi } from '../api';
import axiosInstance from '../axiosSetup';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearStoredData = useCallback(() => {
    console.log('Clearing stored data...');
    ['token', 'refreshToken', 'userSettings', 'user', 'fontSize'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('Stored data cleared');
  }, []);

  const setAuthToken = useCallback((token, refreshToken, rememberMe) => {
    console.log('Setting auth token...');
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
    if (refreshToken) {
      storage.setItem('refreshToken', refreshToken);
    }
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set');
  }, []);

  const refreshToken = useCallback(async () => {
    console.log('Attempting to refresh token...');
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available');
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      console.log('Token refreshed successfully');
      setAuthToken(response.token, response.refreshToken, true);
      return response.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearStoredData();
      throw error;
    }
  }, [clearStoredData, setAuthToken]);

  const fetchUser = useCallback(async () => {
    console.log('Fetching user data...');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.log('No token found, clearing user data');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await userApi.getUserProfile();
      console.log('User data fetched:', userData);
      setUser({
        ...userData,
        hasActiveSubscription: userData.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date()
      });
      localStorage.setItem('fontSize', userData.fontSize || 'medium');
      setError(null);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      if (error.response && error.response.status === 401) {
        console.log('Token expired, attempting to refresh...');
        try {
          await refreshToken();
          const userData = await userApi.getUserProfile();
          console.log('User data fetched after token refresh:', userData);
          setUser({
            ...userData,
            hasActiveSubscription: userData.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date()
          });
          setError(null);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          setUser(null);
          setError('Session expired. Please log in again.');
          clearStoredData();
        }
      } else {
        console.error('Error fetching user data:', error);
        setUser(null);
        setError('Failed to fetch user data. Please try logging in again.');
        clearStoredData();
      }
    } finally {
      setLoading(false);
    }
  }, [clearStoredData, refreshToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (credentials) => {
    console.log('Attempting login...');
    try {
      if (!credentials.reCaptchaToken) {
        console.warn('Login attempt without reCAPTCHA token');
      }
      const response = await loginUser(credentials);
      console.log('Login successful');
      setAuthToken(response.token, response.refreshToken, credentials.rememberMe);
      setUser(response.user);
      setError(null);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
      return { success: false, error: error.message };
    }
  }, [setAuthToken]);

  const register = useCallback(async (userData) => {
    console.log('Attempting registration...');
    try {
      const response = await registerUser(userData);
      console.log('Registration successful');
      setAuthToken(response.token, response.refreshToken, true);
      setUser({
        ...response.user,
        createdAt: new Date().toISOString(),
        hasActiveSubscription: true
      });
      setError(null);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  }, [setAuthToken]);

  const logout = useCallback(async () => {
    console.log('Logging out...');
    try {
      await authApi.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearStoredData();
    }
  }, [clearStoredData]);

  const updateUserSettings = useCallback(async (settings) => {
    try {
      const updatedUser = await userApi.updateUserProfile(settings);
      setUser(prevUser => ({ ...prevUser, ...updatedUser }));
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      setError('Failed to update user settings. Please try again.');
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    fetchUser,
    updateUserSettings,
    setError,
    refreshToken
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserProvider;