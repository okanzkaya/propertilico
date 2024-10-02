const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  changeEmail,
  changePassword,
  uploadAvatar,
  getSubscriptionDetails,
  extendSubscription,
  reduceSubscription,
  getOneMonthSubscription,
  getNotifications,
  markNotificationAsRead,
  updateUserPreferences
} = require('../controllers/userController'); 

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// Logging middleware
router.use((req, res, next) => {
  console.log(`User route accessed: ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Apply protect middleware to all routes
router.use(protect);

// User profile routes
router.route('/profile')
  .get(asyncHandler(getUserProfile))
  .put(asyncHandler(updateUserProfile));

// User preferences route
router.put('/preferences', asyncHandler(updateUserPreferences));

// Authentication routes
router.post('/change-email', asyncHandler(changeEmail));
router.post('/change-password', asyncHandler(changePassword));

// Avatar upload route
router.post('/avatar', upload.single('avatar'), asyncHandler(uploadAvatar));

// Subscription routes
router.get('/subscription', protect, userController.getSubscriptionDetails);
router.post('/extend-subscription', protect, admin, extendSubscription);
router.post('/reduce-subscription', protect, admin, reduceSubscription);
router.post('/get-one-month-subscription', protect, admin, (req, res, next) => {
  console.log('Route hit: get-one-month-subscription');
  console.log('Request body:', req.body);
  userController.getOneMonthSubscription(req, res, next);
});

// Notification routes
router.get('/notifications', asyncHandler(getNotifications));
router.put('/notifications/:id/read', asyncHandler(markNotificationAsRead));

module.exports = router;