const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      subscriptionEndDate: user.subscriptionEndDate,
      maxProperties: user.maxProperties,
      language: user.language,
      timeZone: user.timeZone,
      currency: user.currency,
      dateFormat: user.dateFormat,
      measurementUnit: user.measurementUnit,
      fontSize: user.fontSize,
      theme: user.theme,
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      inAppNotifications: user.inAppNotifications,
      twoFactorAuth: user.twoFactorAuth,
      loginAlerts: user.loginAlerts
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, language, timeZone, currency, dateFormat, measurementUnit, fontSize, theme, emailNotifications, pushNotifications, inAppNotifications, twoFactorAuth, loginAlerts } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (language) user.language = language;
    if (timeZone) user.timeZone = timeZone;
    if (currency) user.currency = currency;
    if (dateFormat) user.dateFormat = dateFormat;
    if (measurementUnit) user.measurementUnit = measurementUnit;
    if (fontSize) user.fontSize = fontSize;
    if (theme) user.theme = theme;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) user.pushNotifications = pushNotifications;
    if (inAppNotifications !== undefined) user.inAppNotifications = inAppNotifications;
    if (twoFactorAuth !== undefined) user.twoFactorAuth = twoFactorAuth;
    if (loginAlerts !== undefined) user.loginAlerts = loginAlerts;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ message: 'Failed to update user profile' });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { newEmail, password } = req.body;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    
    const lastEmailChange = user.lastEmailChange || new Date(0);
    const timeSinceLastChange = Date.now() - lastEmailChange.getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    if (timeSinceLastChange < oneDayInMs) {
      return res.status(400).json({ message: 'You can only change your email once every 24 hours' });
    }
    
    user.email = newEmail;
    user.lastEmailChange = new Date();
    await user.save();
    
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error changing email:', error);
    res.status(500).json({ message: 'Server error during email change' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { oldPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid old password' });
    }
    
    const lastPasswordChange = user.lastPasswordChange || new Date(0);
    const timeSinceLastChange = Date.now() - lastPasswordChange.getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    
    if (timeSinceLastChange < thirtyMinutesInMs) {
      return res.status(400).json({ message: 'You can only change your password once every 30 minutes' });
    }
    
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.lastPasswordChange = new Date();
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Avatar uploaded successfully', avatarUrl: user.avatar });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(400).json({ message: 'Failed to upload avatar' });
  }
};

exports.getSubscriptionDetails = async (req, res) => {
  const user = await User.findById(req.user.id).select('subscriptionEndDate maxProperties');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ subscriptionEndDate: user.subscriptionEndDate, maxProperties: user.maxProperties });
};

exports.extendSubscription = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.subscriptionEndDate = new Date(user.subscriptionEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  await user.save();
  res.json({ message: 'Subscription extended successfully', newEndDate: user.subscriptionEndDate });
};

exports.reduceSubscription = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.subscriptionEndDate = new Date(user.subscriptionEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  await user.save();
  res.json({ message: 'Subscription reduced successfully', newEndDate: user.subscriptionEndDate });
};

exports.getNotifications = async (req, res) => {
  const user = await User.findById(req.user.id).select('notifications');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user.notifications);
};

exports.markNotificationAsRead = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const notification = user.notifications.id(req.params.id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  notification.read = true;
  await user.save();
  res.json({ message: 'Notification marked as read' });
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { theme, fontSize } = req.body;

    if (theme) user.theme = theme;
    if (fontSize) user.fontSize = fontSize;

    await user.save();

    res.json({ message: 'Preferences updated successfully', theme: user.theme, fontSize: user.fontSize });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(400).json({ message: 'Failed to update user preferences' });
  }
};

module.exports = exports;