import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { loginUser, registerUser, userApi, authApi } from '../api';
import axiosInstance from '../axiosSetup';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReCaptcha, setShowReCaptcha] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearStoredData = useCallback(() => {
    ['token', 'refreshToken', 'userSettings', 'user', 'fontSize'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    delete axiosInstance.defaults.headers.common['Authorization'];
  }, []);

  const setAuthToken = useCallback((token, refreshToken, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
    if (refreshToken) {
      storage.setItem('refreshToken', refreshToken);
    }
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      setAuthToken(response.token, response.refreshToken, true);
      return response.token;
    } catch (error) {
      clearStoredData();
      throw error;
    }
  }, [clearStoredData, setAuthToken]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      const userData = await userApi.getUserProfile();
      setUser({
        ...userData,
        hasActiveSubscription: userData.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date()
      });
      localStorage.setItem('fontSize', userData.fontSize || 'medium');
      setError(null);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          const userData = await userApi.getUserProfile();
          setUser({
            ...userData,
            hasActiveSubscription: userData.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date()
          });
          setError(null);
        } catch (refreshError) {
          setUser(null);
          setError('Session expired. Please log in again.');
          clearStoredData();
        }
      } else {
        setUser(null);
        setError('Failed to fetch user data. Please try logging in again.');
        clearStoredData();
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [clearStoredData, refreshToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (credentials) => {
    try {
      const response = await loginUser(credentials);
      setAuthToken(response.token, response.refreshToken, credentials.rememberMe);
      setUser(response.user);
      setError(null);
      return { success: true, user: response.user };
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
      return { success: false, error: error.message };
    }
  }, [setAuthToken]);

  const register = useCallback(async (userData) => {
    try {
      const response = await registerUser(userData);
      setAuthToken(response.token, response.refreshToken, true);
      setUser({
        ...response.user,
        createdAt: new Date().toISOString(),
        hasActiveSubscription: true
      });
      setError(null);
      return { success: true, user: response.user };
    } catch (error) {
      setError('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  }, [setAuthToken]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
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
    refreshToken,
    showReCaptcha,
    setShowReCaptcha,
    isInitialized
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