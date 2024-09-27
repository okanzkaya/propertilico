import axiosInstance from './axiosSetup';


const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    throw new Error('No response received from the server');
  } else {
    throw error;
  }
};

const apiCall = async (method, url, data = null, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await axiosInstance[method](url, method === 'get' ? { params: data } : data, { ...options, headers });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
// Auth API
export const registerUser = (userData) => apiCall('post', '/api/auth/register', userData);
export const loginUser = (userData) => apiCall('post', '/api/auth/login', userData);
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
};
export const checkAuthStatus = () => apiCall('get', '/api/auth/status');
export const requestPasswordReset = (email) => apiCall('post', '/api/auth/request-password-reset', { email });
export const resetPassword = (token, newPassword) => apiCall('post', '/api/auth/reset-password', { token, newPassword });
export const changePassword = (oldPassword, newPassword) => apiCall('post', '/api/user/change-password', JSON.stringify({ oldPassword, newPassword }), {
  headers: { 'Content-Type': 'application/json' }
});

export const changeEmail = (newEmail, password) => apiCall('post', '/api/user/change-email', JSON.stringify({ newEmail, password }), {
  headers: { 'Content-Type': 'application/json' }
});

// User API
export const getProtectedData = () => apiCall('get', '/api/user');
export const getUserProfile = () => apiCall('get', '/api/user');
export const updateUserProfile = (userData) => apiCall('put', '/api/user', userData);
export const getSubscriptionDetails = () => apiCall('get', '/api/user/subscription');
export const extendSubscription = () => apiCall('post', '/api/user/extend-subscription');
export const reduceSubscription = () => apiCall('post', '/api/user/reduce-subscription');
export const getNotifications = () => apiCall('get', '/api/user/notifications');
export const markNotificationAsRead = (notificationId) => apiCall('put', `/api/user/notifications/${notificationId}/read`);
export const updateUserPreferences = (preferences) => apiCall('put', '/api/user/preferences', preferences);
export const uploadAvatar = (formData) => apiCall('post', '/api/user/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Feedback API
export const sendFeedback = (feedbackData) => apiCall('post', '/api/feedback', feedbackData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 60000,
});
export const getFeedback = () => apiCall('get', '/api/feedback');
export const deleteFeedback = (feedbackId) => apiCall('delete', `/api/feedback/${feedbackId}`);
export const updateFeedback = (feedbackId, updateData) => apiCall('put', `/api/feedback/${feedbackId}`, updateData);
export const checkFeedbackLimit = () => apiCall('get', '/api/feedback/check-limit');

// Ticket API
export const createTicket = (ticketData) => apiCall('post', '/api/tickets', ticketData);
export const getTickets = () => apiCall('get', '/api/tickets');
export const getTicketById = (id) => apiCall('get', `/api/tickets/${id}`);
export const updateTicket = (id, ticketData) => apiCall('put', `/api/tickets/${id}`, ticketData);
export const deleteTicket = (id) => apiCall('delete', `/api/tickets/${id}`);
export const addNoteToTicket = (id, noteContent) => apiCall('post', `/api/tickets/${id}/notes`, { content: noteContent });

// Finance API
export const getTransactions = () => apiCall('get', '/api/finances/transactions');
export const addTransaction = (transactionData) => apiCall('post', '/api/finances/transactions', transactionData);
export const updateTransaction = (id, transactionData) => apiCall('put', `/api/finances/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => apiCall('delete', `/api/finances/transactions/${id}`);
export const getFinancialSummary = () => apiCall('get', '/api/finances/summary');

// Report API
export const getReports = () => apiCall('get', '/api/reports');
export const getReportData = (reportId) => apiCall('get', `/api/reports/${reportId}`);
export const createReport = (reportData) => apiCall('post', '/api/reports', reportData);
export const updateReport = ({ id, ...reportData }) => apiCall('put', `/api/reports/${id}`, reportData);
export const deleteReport = (id) => apiCall('delete', `/api/reports/${id}`);
export const getPropertyStats = () => apiCall('get', '/api/reports/properties/stats');
export const getTicketStats = () => apiCall('get', '/api/reports/tickets/stats');
export const getFinancialStats = () => apiCall('get', '/api/reports/finances/stats');
export const getOccupancyStats = () => apiCall('get', '/api/reports/properties/occupancy');

// Property API
export const getProperties = () => apiCall('get', '/api/properties');

// Task API
export const getTasks = () => apiCall('get', '/api/tasks');
export const addTask = (taskData) => apiCall('post', '/api/tasks', taskData);
export const updateTask = (id, taskData) => apiCall('put', `/api/tasks/${id}`, taskData);
export const deleteTask = (id) => apiCall('delete', `/api/tasks/${id}`);

// Contact API
export const getContacts = () => apiCall('get', '/api/contacts');
export const createContact = (contactData) => apiCall('post', '/api/contacts', contactData);
export const getContactById = (id) => apiCall('get', `/api/contacts/${id}`);
export const updateContact = (id, contactData) => apiCall('put', `/api/contacts/${id}`, contactData);
export const deleteContact = (id) => apiCall('delete', `/api/contacts/${id}`);

// Grouped API objects
export const authApi = { 
  registerUser, 
  loginUser, 
  logout, 
  checkAuthStatus, 
  requestPasswordReset, 
  resetPassword,
  changePassword
};
export const userApi = { 
  getProtectedData,
  getUserProfile, 
  updateUserProfile, 
  getSubscriptionDetails, 
  extendSubscription, 
  reduceSubscription, 
  getNotifications, 
  markNotificationAsRead,
  updateUserPreferences,
  changeEmail,
  uploadAvatar
};
export const feedbackApi = { sendFeedback, getFeedback, deleteFeedback, updateFeedback, checkFeedbackLimit };
export const ticketApi = { createTicket, getTickets, getTicketById, updateTicket, deleteTicket, addNoteToTicket };
export const financeApi = { getTransactions, addTransaction, updateTransaction, deleteTransaction, getFinancialSummary };
export const reportApi = { getReports, getReportData, createReport, updateReport, deleteReport, getPropertyStats, getTicketStats, getFinancialStats, getOccupancyStats };
export const propertyApi = { getProperties };
export const taskApi = { getTasks, addTask, updateTask, deleteTask };
export const contactApi = { getContacts, createContact, getContactById, updateContact, deleteContact };