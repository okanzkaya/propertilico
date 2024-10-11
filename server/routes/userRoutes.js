const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Error: Images Only!'));
  },
  limits: { fileSize: 1000000 } // 1MB
});

router.use(protect);

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.post('/change-email', userController.changeEmail);
router.post('/change-password', userController.changePassword);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.get('/subscription', userController.getSubscriptionDetails);
router.post('/extend-subscription', admin, userController.extendSubscription);
router.post('/reduce-subscription', admin, userController.reduceSubscription);
router.post('/get-one-month-subscription', admin, userController.getOneMonthSubscription);
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationAsRead);
router.put('/preferences', userController.updateUserPreferences);

module.exports = router;