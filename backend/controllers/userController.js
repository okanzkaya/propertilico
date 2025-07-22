const path = require('path');
const fs = require('fs');
const { models, sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const updatableFields = [
      'name', 'email', 'language', 'timeZone', 'currency', 
      'dateFormat', 'measurementUnit', 'fontSize', 'theme', 
      'emailNotifications', 'pushNotifications', 'inAppNotifications', 
      'twoFactorAuth', 'loginAlerts'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save({ transaction: t });
    await t.commit();
    res.json(user);
  } catch (error) {
    await t.rollback();
    console.error('Error updating user profile:', error);
    res.status(400).json({ message: 'Failed to update user profile', error: error.message });
  }
};

exports.changeEmail = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const { newEmail, password } = req.body;
    if (!await user.matchPassword(password)) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid password' });
    }

    const existingUser = await models.User.findOne({ 
      where: { email: newEmail }, 
      transaction: t 
    });

    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const lastEmailChange = user.lastEmailChange || new Date(0);
    if (Date.now() - lastEmailChange.getTime() < 24 * 60 * 60 * 1000) {
      await t.rollback();
      return res.status(400).json({ message: 'You can only change your email once every 24 hours' });
    }

    user.email = newEmail;
    user.lastEmailChange = new Date();
    await user.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error changing email:', error);
    res.status(500).json({ message: 'Server error during email change', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!await user.matchPassword(oldPassword)) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid old password' });
    }

    const lastPasswordChange = user.lastPasswordChange || new Date(0);
    if (Date.now() - lastPasswordChange.getTime() < 30 * 60 * 1000) {
      await t.rollback();
      return res.status(400).json({ message: 'You can only change your password once every 30 minutes' });
    }

    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error during password change', error: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    if (!req.file) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await models.User.findByPk(req.user.id, { transaction: t });
    
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if it exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }
    }

    // Update user with new avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save({ transaction: t });

    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Error in uploadAvatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

exports.getSubscriptionDetails = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, { attributes: ['subscriptionEndDate'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      subscriptionEndDate: user.subscriptionEndDate,
      planName: 'Premium',
      maxProperties: 100
    });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ message: 'Error fetching subscription details', error: error.message });
  }
};

exports.extendSubscription = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const newEndDate = new Date(user.subscriptionEndDate || new Date());
    newEndDate.setDate(newEndDate.getDate() + 7);
    user.subscriptionEndDate = newEndDate;
    await user.save({ transaction: t });

    await t.commit();
    res.json({ 
      success: true, 
      message: 'Subscription extended successfully',
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    await t.rollback();
    console.error('Error extending subscription:', error);
    res.status(500).json({ message: 'Error extending subscription', error: error.message });
  }
};

exports.reduceSubscription = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const newEndDate = new Date(user.subscriptionEndDate || new Date());
    newEndDate.setDate(newEndDate.getDate() - 7);
    user.subscriptionEndDate = newEndDate;
    await user.save({ transaction: t });

    await t.commit();
    res.json({ 
      success: true, 
      message: 'Subscription reduced successfully',
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    await t.rollback();
    console.error('Error reducing subscription:', error);
    res.status(500).json({ message: 'Error reducing subscription', error: error.message });
  }
};

exports.getOneMonthSubscription = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    user.subscriptionEndDate = oneMonthFromNow;
    await user.save({ transaction: t });

    await t.commit();
    res.json({
      success: true,
      message: 'One month subscription activated successfully',
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    await t.rollback();
    console.error('Error activating one month subscription:', error);
    res.status(500).json({ message: 'Error activating one month subscription', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, { attributes: ['notifications'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = user.notifications.find(n => n.id === req.params.id);
    if (!notification) {
      await t.rollback();
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await user.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    await t.rollback();
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

exports.updateUserPreferences = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await models.User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const { theme, fontSize } = req.body;
    if (theme) user.theme = theme;
    if (fontSize) user.fontSize = fontSize;
    await user.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Preferences updated successfully', theme: user.theme, fontSize: user.fontSize });
  } catch (error) {
    await t.rollback();
    console.error('Error updating user preferences:', error);
    res.status(400).json({ message: 'Failed to update user preferences', error: error.message });
  }
};

module.exports = exports;