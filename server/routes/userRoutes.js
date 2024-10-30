const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetypes = /image\/jpeg|image\/jpg|image\/png/;
  
  const mimetype = mimetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg formats are allowed'), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});

// Avatar upload route with error handling
router.post('/avatar', protect, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File is too large. Maximum size is 5MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, userController.uploadAvatar);

// User profile routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/', protect, userController.updateUserProfile);
router.post('/change-password', protect, userController.changePassword);
router.post('/change-email', protect, userController.changeEmail);

// Subscription routes
router.get('/subscription', protect, userController.getSubscriptionDetails);
router.post('/extend-subscription', protect, admin, userController.extendSubscription);
router.post('/reduce-subscription', protect, admin, userController.reduceSubscription);
router.post('/get-one-month-subscription', protect, admin, userController.getOneMonthSubscription);

// Notification routes
router.get('/notifications', protect, userController.getNotifications);
router.put('/notifications/:id/read', protect, userController.markNotificationAsRead);
router.put('/preferences', protect, userController.updateUserPreferences);

module.exports = router;