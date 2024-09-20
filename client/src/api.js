import axiosInstance from './axiosSetup';

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/api/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred during registration';
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', userData);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred during login';
  }
};

export const getProtectedData = async () => {
  try {
    const response = await axiosInstance.get('/api/protected/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching protected data:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      // User is not authenticated
      return null;
    }
    throw error.response?.data?.message || error.message || 'An error occurred while fetching protected data';
  }
};

export const extendSubscription = async () => {
  try {
    const response = await axiosInstance.post('/api/protected/extend-subscription');
    return response.data;
  } catch (error) {
    console.error('Error extending subscription:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while extending the subscription';
  }
};

export const reduceSubscription = async () => {
  try {
    const response = await axiosInstance.post('/api/protected/reduce-subscription');
    return response.data;
  } catch (error) {
    console.error('Error reducing subscription:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while reducing the subscription';
  }
};

export const sendFeedback = async (feedbackData) => {
  try {
    const response = await axiosInstance.post('/api/feedback', feedbackData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout for file uploads
    });
    return response.data;
  } catch (error) {
    console.error('Error sending feedback:', error.response?.data || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while sending feedback';
  }
};

export const getFeedback = async () => {
  try {
    const response = await axiosInstance.get('/api/feedback');
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching feedback';
  }
};

export const deleteFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.delete(`/api/feedback/${feedbackId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while deleting feedback';
  }
};

export const updateFeedback = async (feedbackId, updateData) => {
  try {
    const response = await axiosInstance.put(`/api/feedback/${feedbackId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating feedback:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while updating feedback';
  }
};

export const checkFeedbackLimit = async () => {
  try {
    const response = await axiosInstance.get('/api/feedback/check-limit');
    return response.data;
  } catch (error) {
    console.error('Error checking feedback limit:', error.response?.data || error.message);
    console.error('Full error object:', error);
    throw new Error(error.response?.data?.message || error.message || 'An error occurred while checking feedback limit');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
};

export const checkAuthStatus = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/status');
    return response.data.isAuthenticated;
  } catch (error) {
    console.error('Error checking auth status:', error.response?.data?.message || error.message);
    return false;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/api/protected/user', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while updating user profile';
  }
};

export const getSubscriptionDetails = async () => {
  try {
    const response = await axiosInstance.get('/api/protected/subscription');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription details:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching subscription details';
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axiosInstance.post('/api/auth/request-password-reset', { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while requesting password reset';
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while resetting password';
  }
};

export const getNotifications = async () => {
  try {
    const response = await axiosInstance.get('/api/protected/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching notifications';
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/api/protected/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while marking notification as read';
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await axiosInstance.post('/api/tickets', ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getTickets = async () => {
  try {
    const response = await axiosInstance.get('/api/tickets');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getTicketById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateTicket = async (id, ticketData) => {
  try {
    const response = await axiosInstance.put(`/api/tickets/${id}`, ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteTicket = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const addNoteToTicket = async (id, noteContent) => {
  try {
    const response = await axiosInstance.post(`/api/tickets/${id}/notes`, { content: noteContent });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getTransactions = async () => {
  try {
    const response = await axiosInstance.get('/api/finances/transactions');
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching transactions';
  }
};

export const addTransaction = async (transactionData) => {
  try {
    const response = await axiosInstance.post('/api/finances/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error adding transaction:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while adding the transaction';
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const { _id, ...dataToUpdate } = transactionData; // Remove _id from the data to update
    const response = await axiosInstance.put(`/api/finances/transactions/${id}`, dataToUpdate);
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while updating the transaction';
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/finances/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while deleting the transaction';
  }
};

export const getFinancialSummary = async () => {
  try {
    const response = await axiosInstance.get('/api/finances/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching financial summary:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching the financial summary';
  }
};

export const getReports = async () => {
  try {
    const response = await axiosInstance.get('/api/reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching reports';
  }
};

export const getReportData = async (reportId) => {
  try {
    const response = await axiosInstance.get(`/api/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching report data:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching report data';
  }
};
export const createReport = async (reportData) => {
  try {
    const response = await axiosInstance.post('/api/reports', reportData);
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while creating the report';
  }
};

export const updateReport = async ({ id, ...reportData }) => {
  try {
    const response = await axiosInstance.put(`/api/reports/${id}`, reportData);
    return response.data;
  } catch (error) {
    console.error('Error updating report:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while updating the report';
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting report:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while deleting the report';
  }
};

export const getPropertyStats = async () => {
  try {
    const response = await axiosInstance.get('/api/reports/properties/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching property stats:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching property stats';
  }
};

export const getTicketStats = async () => {
  try {
    const response = await axiosInstance.get('/api/reports/tickets/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket stats:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching ticket stats';
  }
};

export const getFinancialStats = async () => {
  try {
    const response = await axiosInstance.get('/api/reports/finances/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching financial stats:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching financial stats';
  }
};

export const getOccupancyStats = async () => {
  try {
    const response = await axiosInstance.get('/api/reports/properties/occupancy');
    return response.data;
  } catch (error) {
    console.error('Error fetching occupancy stats:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error.message || 'An error occurred while fetching occupancy stats';
  }
};

