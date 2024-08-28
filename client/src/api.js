// client/src/api.js
import axiosInstance from './axiosSetup';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
});

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axiosInstance.post('/auth/login', userData);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  return response.data;
};

export const getProtectedData = async () => {
  return (await axiosInstance.get('/protected/user', authHeaders())).data;
};

export const extendSubscription = async () => {
  return (await axiosInstance.post('/protected/extend-subscription', {}, authHeaders())).data;
};

export const reduceSubscription = async () => {
  return (await axiosInstance.post('/protected/reduce-subscription', {}, authHeaders())).data;
};
