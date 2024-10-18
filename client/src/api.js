import axiosInstance from './axiosSetup';

// Fallback data
const fallbackData = {
  propertyStats: { totalProperties: 0, occupiedProperties: 0, vacantProperties: 0, occupancyRate: 0 },
  ticketStats: { openTickets: 0, inProgressTickets: 0, closedTickets: 0, totalTickets: 0 },
  occupancyStats: [{ name: 'Occupied', value: 0 }, { name: 'Vacant', value: 0 }],
  tickets: [],
  transactions: [],
  properties: [],
  tasks: [],
  contacts: []
};

// Generic API call function
const apiCall = async (method, url, data = null, options = {}) => {
  try {
    console.log(`API Call: ${method.toUpperCase()} ${url}`);
    const config = {
      method,
      url,
      timeout: 10000, // 10 seconds timeout
      ...options,
    };

    if (method.toLowerCase() !== 'get' && method.toLowerCase() !== 'delete') {
      config.data = data;
    } else if (method.toLowerCase() === 'get') {
      config.params = data;
    }

    const response = await axiosInstance(config);

    console.log(`API Response: ${url}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error: ${url}`, error.response?.data || error.message);

    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      return fallbackData[url.split('/').pop()] || null;
    }

    if (error.response) {
      if (error.response.status === 403 && error.response.data.redirect === '/my-plan') {
        window.location.href = '/my-plan';
        throw new Error('Subscription required');
      }

      console.error('Response error:', error.response.status, error.response.data);
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      console.error('No response received:', error.request);
      return fallbackData[url.split('/').pop()] || null;
    } else {
      console.error('Error setting up request:', error.message);
      throw error;
    }
  }
};

// Auth API
export const registerUser = (userData) => apiCall('post', '/api/auth/register', userData);
export const loginUser = (userData) => apiCall('post', '/api/auth/login', userData);
export const googleLogin = (tokenId) => apiCall('post', '/api/auth/google', { tokenId });
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
};
export const checkAuthStatus = () => apiCall('get', '/api/auth/status');
export const refreshToken = (refreshToken) => apiCall('post', '/api/auth/refresh-token', { refreshToken });
export const requestPasswordReset = (email) => apiCall('post', '/api/auth/request-password-reset', { email });
export const resetPassword = (token, newPassword) => apiCall('post', '/api/auth/reset-password', { token, newPassword });
export const changePassword = (oldPassword, newPassword) => apiCall('post', '/api/user/change-password', { oldPassword, newPassword });
export const changeEmail = (newEmail, password) => apiCall('post', '/api/user/change-email', { newEmail, password });

// User API
export const getProtectedData = () => apiCall('get', '/api/user');
export const getUserProfile = () => apiCall('get', '/api/user/profile');
export const updateUserProfile = (userData) => apiCall('put', '/api/user', userData);
export const getSubscriptionDetails = () => apiCall('get', '/api/user/subscription');
export const extendSubscription = () => apiCall('post', '/api/user/extend-subscription', {});
export const reduceSubscription = () => apiCall('post', '/api/user/reduce-subscription', {});
export const getNotifications = () => apiCall('get', '/api/user/notifications');
export const markNotificationAsRead = (notificationId) => apiCall('put', `/api/user/notifications/${notificationId}/read`);
export const updateUserPreferences = (preferences) => apiCall('put', '/api/user/preferences', preferences);
export const uploadAvatar = (formData) => apiCall('post', '/api/user/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getOneMonthSubscription = () => apiCall('post', '/api/user/get-one-month-subscription', {});

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
export const updateTicket = (id, ticketData) => {
  if (!id) {
    return Promise.reject(new Error('Ticket ID is required'));
  }
  return apiCall('put', `/api/tickets/${id}`, ticketData);
};

export const deleteTicket = (id) => {
  if (!id) {
    return Promise.reject(new Error('Ticket ID is required'));
  }
  return apiCall('delete', `/api/tickets/${id}`);
};
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
export const getAllStats = () => apiCall('get', '/api/reports/all-stats');
// Property API
export const getProperties = () => apiCall('get', '/api/properties');

// Task API
export const getTasks = () => apiCall('get', '/api/tasks');
export const addTask = (taskData) => apiCall('post', '/api/tasks', taskData);
export const updateTask = (id, taskData) => apiCall('put', `/api/tasks/${id}`, taskData);
export const deleteTask = (id) => apiCall('delete', `/api/tasks/${id}`);

// Contact API
export const getContacts = () => apiCall('get', '/api/contacts');
export const createContact = (contactData) =>
  apiCall('post', '/api/contacts', contactData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
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
  changePassword,
  googleLogin,
  refreshToken
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
  uploadAvatar,
  getOneMonthSubscription
};

export const feedbackApi = { sendFeedback, getFeedback, deleteFeedback, updateFeedback, checkFeedbackLimit };
export const ticketApi = { createTicket, getTickets, getTicketById, updateTicket, deleteTicket, addNoteToTicket };
export const financeApi = { getTransactions, addTransaction, updateTransaction, deleteTransaction, getFinancialSummary };
export const reportApi = {
  getReports,
  getReportData,
  createReport,
  updateReport,
  deleteReport,
  getAllStats,
  getPropertyStats,
  getTicketStats,
  getFinancialStats,
  getOccupancyStats
};
export const propertyApi = { getProperties };
export const taskApi = { getTasks, addTask, updateTask, deleteTask };
export const contactApi = { getContacts, createContact, getContactById, updateContact, deleteContact };

const apiModules = {
  authApi,
  userApi,
  feedbackApi,
  ticketApi,
  financeApi,
  reportApi,
  propertyApi,
  taskApi,
  contactApi
};

export default apiModules;