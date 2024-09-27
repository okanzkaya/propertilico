const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  refreshAccessToken, 
  getUserProfile, 
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Wrap each route handler with a try-catch block
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(authUser));
router.post('/refresh-token', asyncHandler(refreshAccessToken));
router.get('/profile', protect, asyncHandler(getUserProfile));
router.put('/profile', protect, asyncHandler(updateUserProfile));
router.post('/change-password', protect, asyncHandler(changePassword));
router.post('/request-password-reset', asyncHandler(requestPasswordReset));
router.post('/reset-password', asyncHandler(resetPassword));

module.exports = router;