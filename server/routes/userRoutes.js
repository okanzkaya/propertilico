const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

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

// Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// Helper function
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes
router.get('/profile', protect, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

router.put('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updatableFields = ['name', 'email', 'language', 'timeZone', 'currency', 'dateFormat', 'measurementUnit', 'fontSize', 'theme', 'emailNotifications', 'pushNotifications', 'inAppNotifications', 'twoFactorAuth', 'loginAlerts'];
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save();
  res.json(user);
}));

router.post('/change-email', protect, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { newEmail, password } = req.body;
  if (!await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  const existingUser = await User.findOne({ where: { email: newEmail } });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already in use' });
  }

  const lastEmailChange = user.lastEmailChange || new Date(0);
  if (Date.now() - lastEmailChange.getTime() < 24 * 60 * 60 * 1000) {
    return res.status(400).json({ message: 'You can only change your email once every 24 hours' });
  }

  user.email = newEmail;
  user.lastEmailChange = new Date();
  await user.save();

  res.json({ message: 'Email updated successfully' });
}));

router.post('/change-password', protect, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { oldPassword, newPassword } = req.body;
  if (!await bcrypt.compare(oldPassword, user.password)) {
    return res.status(400).json({ message: 'Invalid old password' });
  }

  const lastPasswordChange = user.lastPasswordChange || new Date(0);
  if (Date.now() - lastPasswordChange.getTime() < 30 * 60 * 1000) {
    return res.status(400).json({ message: 'You can only change your password once every 30 minutes' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.lastPasswordChange = new Date();
  await user.save();

  res.json({ message: 'Password changed successfully' });
}));

router.post('/avatar', protect, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.avatar = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  res.json({ message: 'Avatar uploaded successfully', avatarUrl: user.avatar });
}));

router.get('/subscription', protect, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['subscriptionEndDate'] });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    subscriptionEndDate: user.subscriptionEndDate,
    planName: 'Premium',
    maxProperties: 100
  });
}));

router.post('/extend-subscription', protect, admin, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const newEndDate = new Date(user.subscriptionEndDate || new Date());
  newEndDate.setDate(newEndDate.getDate() + 7);
  user.subscriptionEndDate = newEndDate;
  await user.save();

  res.json({ 
    success: true, 
    message: 'Subscription extended successfully',
    subscriptionEndDate: user.subscriptionEndDate
  });
}));

router.post('/reduce-subscription', protect, admin, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const newEndDate = new Date(user.subscriptionEndDate || new Date());
  newEndDate.setDate(newEndDate.getDate() - 7);
  user.subscriptionEndDate = newEndDate;
  await user.save();

  res.json({ 
    success: true, 
    message: 'Subscription reduced successfully',
    subscriptionEndDate: user.subscriptionEndDate
  });
}));

router.post('/get-one-month-subscription', protect, admin, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  user.subscriptionEndDate = oneMonthFromNow;
  await user.save();

  res.json({
    success: true,
    message: 'One month subscription activated successfully',
    subscriptionEndDate: user.subscriptionEndDate
  });
}));

router.get('/notifications', protect, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['notifications'] });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user.notifications);
}));

router.put('/notifications/:id/read', protect, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const notificationIndex = user.notifications.findIndex(n => n.id === req.params.id);
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  user.notifications[notificationIndex].read = true;
  await user.save();
  res.json({ message: 'Notification marked as read' });
}));

router.put('/preferences', protect, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { theme, fontSize } = req.body;
  if (theme) user.theme = theme;
  if (fontSize) user.fontSize = fontSize;
  await user.save();

  res.json({ message: 'Preferences updated successfully', theme: user.theme, fontSize: user.fontSize });
}));

module.exports = router;