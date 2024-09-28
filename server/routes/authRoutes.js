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

// Validation middleware
const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 8 or more characters')
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  check('captcha', 'CAPTCHA verification failed').not().isEmpty()
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  check('captcha', 'CAPTCHA verification failed').not().isEmpty()
];

// Wrap each route handler with a try-catch block
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/register', registerValidation, asyncHandler(registerUser));
router.post('/login', loginValidation, asyncHandler(authUser));
router.post('/refresh-token', asyncHandler(refreshAccessToken));
router.get('/profile', protect, asyncHandler(getUserProfile));
router.put('/profile', protect, asyncHandler(updateUserProfile));
router.post('/change-password', protect, [
  check('oldPassword', 'Old password is required').exists(),
  check('newPassword', 'Please enter a password with 8 or more characters')
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], asyncHandler(changePassword));
router.post('/forgot-password', [
  check('email', 'Please include a valid email').isEmail()
], asyncHandler(forgotPassword));
router.post('/reset-password', [
  check('token', 'Token is required').exists(),
  check('newPassword', 'Please enter a password with 8 or more characters')
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], asyncHandler(resetPassword));
router.get('/status', protect, asyncHandler(checkAuthStatus));
router.post('/logout', protect, asyncHandler(logout));

module.exports = router;