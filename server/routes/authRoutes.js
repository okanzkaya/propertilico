const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  registerUser, 
  authUser, 
  refreshAccessToken, 
  getUserProfile, 
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  checkAuthStatus,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const validations = {
  register: [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    check('captcha', 'CAPTCHA verification failed').notEmpty()
  ],
  login: [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').notEmpty(),
    check('reCaptchaToken', 'reCAPTCHA token is required').notEmpty(),
    check('rememberMe', 'Remember me should be a boolean').optional().isBoolean()
  ],
  changePassword: [
    check('oldPassword', 'Old password is required').notEmpty(),
    check('newPassword', 'New password must be at least 8 characters long').isLength({ min: 8 })
  ],
  forgotPassword: [
    check('email', 'Please include a valid email').isEmail().normalizeEmail()
  ],
  resetPassword: [
    check('token', 'Token is required').notEmpty(),
    check('newPassword', 'New password must be at least 8 characters long').isLength({ min: 8 })
  ]
};

router.post('/register', validations.register, asyncHandler(registerUser));
router.post('/login', validations.login, asyncHandler(authUser));
router.post('/refresh-token', asyncHandler(refreshAccessToken));
router.get('/profile', protect, asyncHandler(getUserProfile));
router.put('/profile', protect, asyncHandler(updateUserProfile));
router.post('/change-password', protect, validations.changePassword, asyncHandler(changePassword));
router.post('/forgot-password', validations.forgotPassword, asyncHandler(forgotPassword));
router.post('/reset-password', validations.resetPassword, asyncHandler(resetPassword));
router.get('/status', protect, asyncHandler(checkAuthStatus));
router.post('/logout', protect, asyncHandler(logout));

module.exports = router;