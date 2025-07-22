const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
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

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

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

router.post('/register', validations.register, handleErrors, registerUser);
router.post('/login', validations.login, handleErrors, authUser);
router.post('/refresh-token', refreshAccessToken);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/change-password', protect, validations.changePassword, handleErrors, changePassword);
router.post('/forgot-password', validations.forgotPassword, handleErrors, forgotPassword);
router.post('/reset-password', validations.resetPassword, handleErrors, resetPassword);
router.get('/status', protect, checkAuthStatus);
router.post('/logout', protect, logout);

module.exports = router;