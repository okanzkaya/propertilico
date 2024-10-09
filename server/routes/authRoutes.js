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

router.post('/register', validations.register, handleErrors, (req, res, next) => {
  registerUser(req, res).catch(next);
});

router.post('/login', validations.login, handleErrors, (req, res, next) => {
  authUser(req, res).catch(next);
});

router.post('/refresh-token', (req, res, next) => {
  refreshAccessToken(req, res).catch(next);
});

router.get('/profile', protect, (req, res, next) => {
  getUserProfile(req, res).catch(next);
});

router.put('/profile', protect, (req, res, next) => {
  updateUserProfile(req, res).catch(next);
});

router.post('/change-password', protect, validations.changePassword, handleErrors, (req, res, next) => {
  changePassword(req, res).catch(next);
});

router.post('/forgot-password', validations.forgotPassword, handleErrors, (req, res, next) => {
  forgotPassword(req, res).catch(next);
});

router.post('/reset-password', validations.resetPassword, handleErrors, (req, res, next) => {
  resetPassword(req, res).catch(next);
});

router.get('/status', protect, (req, res, next) => {
  checkAuthStatus(req, res).catch(next);
});

router.post('/logout', protect, (req, res, next) => {
  logout(req, res).catch(next);
});

module.exports = router;