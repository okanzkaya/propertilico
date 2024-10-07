const { User } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatableFields = ['name', 'email', 'language', 'timeZone', 'currency', 'dateFormat', 'measurementUnit', 'fontSize', 'theme', 'emailNotifications', 'pushNotifications', 'inAppNotifications', 'twoFactorAuth', 'loginAlerts'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update user profile', error: error.message });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { newEmail, password } = req.body;
    if (!await user.matchPassword(password)) {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error during email change', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { oldPassword, newPassword } = req.body;
    if (!await user.matchPassword(oldPassword)) {
      return res.status(400).json({ message: 'Invalid old password' });
    }

    const lastPasswordChange = user.lastPasswordChange || new Date(0);
    if (Date.now() - lastPasswordChange.getTime() < 30 * 60 * 1000) {
      return res.status(400).json({ message: 'You can only change your password once every 30 minutes' });
    }

    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during password change', error: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Avatar uploaded successfully', avatarUrl: user.avatar });
  } catch (error) {
    res.status(400).json({ message: 'Failed to upload avatar', error: error.message });
  }
};

exports.getSubscriptionDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['subscriptionEndDate'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      subscriptionEndDate: user.subscriptionEndDate,
      planName: 'Premium',
      maxProperties: 100
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription details', error: error.message });
  }
};

exports.extendSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newEndDate = new Date(user.subscriptionEndDate || new Date());
    newEndDate.setDate(newEndDate.getDate() + 7);
    user.subscriptionEndDate = newEndDate;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Subscription extended successfully',
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error extending subscription', error: error.message });
  }
};

exports.reduceSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newEndDate = new Date(user.subscriptionEndDate || new Date());
    newEndDate.setDate(newEndDate.getDate() - 7);
    user.subscriptionEndDate = newEndDate;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Subscription reduced successfully',
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reducing subscription', error: error.message });
  }
};

exports.getOneMonthSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    user.subscriptionEndDate = oneMonthFromNow;
    await user.save();

    res.json({
      success: true,
      message: 'One month subscription activated successfully',
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error activating one month subscription', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['notifications'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notification = user.notifications.find(n => n.id === req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await user.save();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { theme, fontSize } = req.body;
    if (theme) user.theme = theme;
    if (fontSize) user.fontSize = fontSize;
    await user.save();

    res.json({ message: 'Preferences updated successfully', theme: user.theme, fontSize: user.fontSize });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update user preferences', error: error.message });
  }
};

module.exports = exports;