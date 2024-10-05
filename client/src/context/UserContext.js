import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { loginUser, registerUser, userApi } from '../api';
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
      const response = await userApi.refreshToken(refreshToken);
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
      setUser(userData);
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
          setUser(userData);
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
      const response = await loginUser(credentials);
      console.log('Login successful');
      setAuthToken(response.token, response.refreshToken, credentials.rememberMe);
      setUser(response.user);
      setError(null);
      await fetchUser();
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 400 && error.response.data.message === 'reCAPTCHA verification failed') {
        // If reCAPTCHA verification fails, we'll try to login without it
        try {
          const responseWithoutCaptcha = await loginUser({ ...credentials, reCaptchaToken: null });
          console.log('Login successful without reCAPTCHA');
          setAuthToken(responseWithoutCaptcha.token, responseWithoutCaptcha.refreshToken, credentials.rememberMe);
          setUser(responseWithoutCaptcha.user);
          setError(null);
          await fetchUser();
          return { success: true, user: responseWithoutCaptcha.user };
        } catch (retryError) {
          console.error('Login retry error:', retryError);
          setError('Login failed. Please try again.');
          return { success: false, error: retryError.message };
        }
      } else {
        setError('Login failed. Please check your credentials and try again.');
        return { success: false, error: error.message };
      }
    }
  }, [fetchUser, setAuthToken]);

  const register = useCallback(async (userData) => {
    console.log('Attempting registration...');
    try {
      const response = await registerUser(userData);
      console.log('Registration successful');
      setAuthToken(response.token, response.refreshToken, true);
      setUser({
        ...response.user,
        createdAt: new Date().toISOString() // Ensure createdAt is set for new users
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
      await userApi.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearStoredData();
    }
  }, [clearStoredData]);

  const updateUserSettings = useCallback(async (settings) => {
    console.log('Updating user settings...');
    try {
      const updatedUser = await userApi.updateUserProfile(settings);
      console.log('User settings updated:', updatedUser);
      setUser(prevUser => ({ ...prevUser, ...updatedUser }));
      if (settings.fontSize) {
        localStorage.setItem('fontSize', settings.fontSize);
      }
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      setError('Failed to update user settings. Please try again.');
      throw error;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    console.log('Checking auth status...');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.log('No token found, user is not authenticated');
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/auth/status`);
      if (response.data.isAuthenticated) {
        console.log('User is authenticated');
        setUser(response.data.user);
        setLoading(false);
        return true;
      } else {
        console.log('User is not authenticated');
        setUser(null);
        clearStoredData();
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      if (error.response && error.response.status === 401) {
        console.log('Token expired, attempting to refresh...');
        try {
          await refreshToken();
          return await checkAuthStatus();
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          setUser(null);
          clearStoredData();
          setLoading(false);
          return false;
        }
      }
      setUser(null);
      clearStoredData();
      setLoading(false);
      return false;
    }
  }, [clearStoredData, refreshToken]);

  const hasActiveSubscription = useCallback(() => {
    if (!user || !user.subscriptionEndDate) return false;
    const subscriptionEnd = new Date(user.subscriptionEndDate);
    return subscriptionEnd > new Date();
  }, [user]);

  const isSubscriptionExpiringSoon = useCallback(() => {
    if (!user || !user.subscriptionEndDate) return false;
    const subscriptionEnd = new Date(user.subscriptionEndDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return subscriptionEnd <= thirtyDaysFromNow && subscriptionEnd > new Date();
  }, [user]);

  const getRemainingSubscriptionDays = useCallback(() => {
    if (!user || !user.subscriptionEndDate) return 0;
    const subscriptionEnd = new Date(user.subscriptionEndDate);
    const today = new Date();
    const diffTime = Math.abs(subscriptionEnd - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [user]);

  const updateSubscription = useCallback(async (action) => {
    console.log(`Updating subscription: ${action}`);
    try {
      const response = await userApi[action === 'extend' ? 'extendSubscription' : 'reduceSubscription']();
      console.log('Subscription updated:', response);
      setUser(prevUser => ({ ...prevUser, subscriptionEndDate: response.subscriptionEndDate }));
      return response;
    } catch (error) {
      console.error(`Failed to ${action} subscription:`, error);
      setError(`Failed to ${action} subscription. Please try again.`);
      throw error;
    }
  }, []);

  const getSubscriptionStatus = useCallback(() => {
    if (!user || !user.subscriptionEndDate) return 'inactive';
    const subscriptionEnd = new Date(user.subscriptionEndDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (subscriptionEnd <= now) return 'expired';
    if (subscriptionEnd <= thirtyDaysFromNow) return 'expiring_soon';
    return 'active';
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    register,
    fetchUser,
    updateUserSettings,
    checkAuthStatus,
    hasActiveSubscription,
    isSubscriptionExpiringSoon,
    getRemainingSubscriptionDays,
    updateSubscription,
    getSubscriptionStatus,
    setError,
    refreshToken
  }), [
    user,
    loading,
    error,
    login,
    logout,
    register,
    fetchUser,
    updateUserSettings,
    checkAuthStatus,
    hasActiveSubscription,
    isSubscriptionExpiringSoon,
    getRemainingSubscriptionDays,
    updateSubscription,
    getSubscriptionStatus,
    refreshToken
  ]);

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