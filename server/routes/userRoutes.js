const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  changeEmail,
  changePassword,
  uploadAvatar,
  getSubscriptionDetails,
  extendSubscription,
  reduceSubscription,
  getNotifications,
  markNotificationAsRead,
  updateUserPreferences
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({ storage: storage });

// Add this logging middleware
router.use((req, res, next) => {
  console.log(`User route accessed: ${req.method} ${req.url}`);
  next();
});

// Wrap each route handler with a try-catch block
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Apply the protect middleware to all routes
router.use(protect);

router.get('/', asyncHandler(getUserProfile));
router.put('/', asyncHandler(updateUserProfile));
router.put('/preferences', asyncHandler(updateUserPreferences));
router.post('/change-email', asyncHandler(changeEmail));
router.post('/change-password', asyncHandler(changePassword));
router.post('/avatar', upload.single('avatar'), asyncHandler(uploadAvatar));
router.get('/subscription', asyncHandler(getSubscriptionDetails));
router.post('/extend-subscription', asyncHandler(extendSubscription));
router.post('/reduce-subscription', asyncHandler(reduceSubscription));
router.get('/notifications', asyncHandler(getNotifications));
router.put('/notifications/:id/read', asyncHandler(markNotificationAsRead));

module.exports = router;