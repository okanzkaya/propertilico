const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');

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

// Helper function
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes
router.get('/profile', protect, asyncHandler(async (req, res) => {
  console.log(`Fetching profile for user: ${req.user.id}`);
  res.json(req.user);
}));

router.put('/profile', protect, asyncHandler(async (req, res) => {
  console.log(`Updating profile for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const updatableFields = ['name', 'email', 'language', 'timeZone', 'currency', 'dateFormat', 'measurementUnit', 'fontSize', 'theme', 'emailNotifications', 'pushNotifications', 'inAppNotifications', 'twoFactorAuth', 'loginAlerts'];
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save();
  console.log(`Profile updated for user: ${req.user.id}`);
  res.json({ message: 'Profile updated successfully', user });
}));

router.post('/change-email', protect, asyncHandler(async (req, res) => {
  console.log(`Attempting to change email for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const { newEmail, password } = req.body;
  if (!await bcrypt.compare(password, user.password)) {
    console.log(`Invalid password for email change: ${req.user.id}`);
    return res.status(400).json({ message: 'Invalid password' });
  }

  const existingUser = await models.User.findOne({ where: { email: newEmail } });
  if (existingUser) {
    console.log(`Email already in use: ${newEmail}`);
    return res.status(400).json({ message: 'Email is already in use' });
  }

  const lastEmailChange = user.lastEmailChange || new Date(0);
  if (Date.now() - lastEmailChange.getTime() < 24 * 60 * 60 * 1000) {
    console.log(`Too soon for email change: ${req.user.id}`);
    return res.status(400).json({ message: 'You can only change your email once every 24 hours' });
  }

  user.email = newEmail;
  user.lastEmailChange = new Date();
  await user.save();

  console.log(`Email updated successfully for user: ${req.user.id}`);
  res.json({ message: 'Email updated successfully' });
}));

router.post('/change-password', protect, asyncHandler(async (req, res) => {
  console.log(`Attempting to change password for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const { oldPassword, newPassword } = req.body;
  if (!await bcrypt.compare(oldPassword, user.password)) {
    console.log(`Invalid old password for password change: ${req.user.id}`);
    return res.status(400).json({ message: 'Invalid old password' });
  }

  const lastPasswordChange = user.lastPasswordChange || new Date(0);
  if (Date.now() - lastPasswordChange.getTime() < 30 * 60 * 1000) {
    console.log(`Too soon for password change: ${req.user.id}`);
    return res.status(400).json({ message: 'You can only change your password once every 30 minutes' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.lastPasswordChange = new Date();
  await user.save();

  console.log(`Password changed successfully for user: ${req.user.id}`);
  res.json({ message: 'Password changed successfully' });
}));

router.post('/avatar', protect, upload.single('avatar'), asyncHandler(async (req, res) => {
  console.log(`Attempting to upload avatar for user: ${req.user.id}`);
  if (!req.file) {
    console.log(`No file uploaded for avatar: ${req.user.id}`);
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  user.avatar = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  console.log(`Avatar uploaded successfully for user: ${req.user.id}`);
  res.json({ message: 'Avatar uploaded successfully', avatarUrl: user.avatar });
}));

router.get('/subscription', protect, asyncHandler(async (req, res) => {
  console.log(`Fetching subscription details for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id, { attributes: ['subscriptionEndDate'] });
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    subscriptionEndDate: user.subscriptionEndDate,
    planName: 'Premium',
    maxProperties: 100
  });
}));

router.post('/extend-subscription', protect, admin, asyncHandler(async (req, res) => {
  console.log(`Extending subscription for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const newEndDate = new Date(user.subscriptionEndDate || new Date());
  newEndDate.setDate(newEndDate.getDate() + 7);
  user.subscriptionEndDate = newEndDate;
  await user.save();

  console.log(`Subscription extended successfully for user: ${req.user.id}`);
  res.json({ 
    success: true, 
    message: 'Subscription extended successfully',
    subscriptionEndDate: user.subscriptionEndDate
  });
}));

router.post('/reduce-subscription', protect, admin, asyncHandler(async (req, res) => {
  console.log(`Reducing subscription for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const newEndDate = new Date(user.subscriptionEndDate || new Date());
  newEndDate.setDate(newEndDate.getDate() - 7);
  user.subscriptionEndDate = newEndDate;
  await user.save();

  console.log(`Subscription reduced successfully for user: ${req.user.id}`);
  res.json({ 
    success: true, 
    message: 'Subscription reduced successfully',
    subscriptionEndDate: user.subscriptionEndDate
  });
}));

router.post('/get-one-month-subscription', protect, admin, asyncHandler(async (req, res) => {
  console.log(`Activating one month subscription for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  user.subscriptionEndDate = oneMonthFromNow;
  await user.save();

  console.log(`One month subscription activated successfully for user: ${req.user.id}`);
  res.json({
    success: true,
    message: 'One month subscription activated successfully',
    subscriptionEndDate: user.subscriptionEndDate
  });
}));

router.get('/notifications', protect, asyncHandler(async (req, res) => {
  console.log(`Fetching notifications for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id, { attributes: ['notifications'] });
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user.notifications);
}));

router.put('/notifications/:id/read', protect, asyncHandler(async (req, res) => {
  console.log(`Marking notification as read for user: ${req.user.id}, notification: ${req.params.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const notificationIndex = user.notifications.findIndex(n => n.id === req.params.id);
  if (notificationIndex === -1) {
    console.log(`Notification not found: ${req.params.id}`);
    return res.status(404).json({ message: 'Notification not found' });
  }

  user.notifications[notificationIndex].read = true;
  await user.save();
  console.log(`Notification marked as read: ${req.params.id}`);
  res.json({ message: 'Notification marked as read' });
}));

router.put('/preferences', protect, asyncHandler(async (req, res) => {
  console.log(`Updating preferences for user: ${req.user.id}`);
  const user = await models.User.findByPk(req.user.id);
  if (!user) {
    console.log(`User not found: ${req.user.id}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const { theme, fontSize } = req.body;
  if (theme) user.theme = theme;
  if (fontSize) user.fontSize = fontSize;
  await user.save();

  console.log(`Preferences updated successfully for user: ${req.user.id}`);
  res.json({ message: 'Preferences updated successfully', theme: user.theme, fontSize: user.fontSize });
}));

module.exports = router;