import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { userApi } from '../api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const userData = await userApi.getUserProfile();
      setUser(userData);
      localStorage.setItem('fontSize', userData.fontSize || 'medium');
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback((userData) => {
    setUser(userData);
    const storage = userData.rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', userData.token);
    if (userData.refreshToken) {
      storage.setItem('refreshToken', userData.refreshToken);
    } else {
      console.warn('No refresh token received during login');
    }
    // Store the entire user data
    storage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userSettings');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  }, []);

  const updateUserSettings = useCallback(async (newSettings) => {
    try {
      const updatedUser = { ...user, ...newSettings };
      setUser(updatedUser);
      localStorage.setItem('userSettings', JSON.stringify(updatedUser));
      await userApi.updateUserProfile(newSettings);
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  }, [user]);

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    updateUserSettings,
    fetchUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};