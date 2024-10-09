const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const axios = require('axios');
const { models } = require('../config/db');
const { Op } = require('sequelize');

const generateTokens = (id) => ({
  token: jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
});

const handleResponse = (res, status, data) => res.status(status).json(data);

const verifyRecaptcha = async (token) => {
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  return response.data.success;
};

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return handleResponse(res, 400, { success: false, errors: errors.array() });

  try {
    const { name, email, password, captcha } = req.body;

    if (!(await verifyRecaptcha(captcha))) {
      return handleResponse(res, 400, { success: false, message: 'Invalid captcha' });
    }

    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) return handleResponse(res, 400, { success: false, message: 'User already exists' });

    const user = await models.User.create({ name, email, password });
    const tokens = generateTokens(user.id);

    handleResponse(res, 201, {
      success: true,
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.authUser = async (req, res) => {
  try {
    const { email, password, reCaptchaToken } = req.body;
    
    if (!email || !password) {
      return handleResponse(res, 400, { success: false, message: 'Email and password are required' });
    }

    if (process.env.NODE_ENV === 'production') {
      if (!reCaptchaToken) {
        return handleResponse(res, 400, { success: false, message: 'reCAPTCHA verification is required' });
      }

      const recaptchaVerified = await verifyRecaptcha(reCaptchaToken);
      if (!recaptchaVerified) {
        console.log('reCAPTCHA verification failed');
        return handleResponse(res, 400, { success: false, message: 'reCAPTCHA verification failed' });
      }
      console.log('reCAPTCHA verification successful');
    } else {
      console.log('Skipping reCAPTCHA verification in development mode');
    }

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return handleResponse(res, 401, { success: false, message: 'Invalid credentials' });
    }

    if (!(await user.matchPassword(password))) {
      await user.incrementLoginAttempts();
      if (user.isLocked()) {
        return handleResponse(res, 401, { success: false, message: 'Account is locked. Try again later.' });
      }
      return handleResponse(res, 401, { success: false, message: 'Invalid credentials' });
    }

    if (user.isLocked()) {
      return handleResponse(res, 401, { success: false, message: 'Account is locked. Try again later.' });
    }

    await user.resetLoginAttempts();
    await user.updateLastLogin();

    const tokens = generateTokens(user.id);

    const hasActiveSubscription = user.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date();

    handleResponse(res, 200, {
      success: true,
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
        hasActiveSubscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    handleResponse(res, 500, { success: false, message: 'An error occurred during login' });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return handleResponse(res, 401, { success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await models.User.findByPk(decoded.id);
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });

    const newTokens = generateTokens(user.id);
    handleResponse(res, 200, { success: true, ...newTokens });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return handleResponse(res, 403, { success: false, message: 'Invalid refresh token' });
    }
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return handleResponse(res, 404, { success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send email with reset token
    handleResponse(res, 200, { 
      success: true,
      message: 'Password reset email sent',
      resetToken // Remove this in production
    });
  } catch (error) {
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await models.User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return handleResponse(res, 400, { success: false, message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.lastPasswordChange = new Date();
    await user.save();

    handleResponse(res, 200, { success: true, message: 'Password reset successful' });
  } catch (error) {
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await models.User.findByPk(req.user.id);
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });

    if (!(await user.matchPassword(oldPassword))) {
      return handleResponse(res, 400, { success: false, message: 'Old password is incorrect' });
    }

    if (user.lastPasswordChange && (new Date() - user.lastPasswordChange) < 30 * 60 * 1000) {
      return handleResponse(res, 400, { success: false, message: 'You can only change your password once every 30 minutes' });
    }

    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save();

    handleResponse(res, 200, { success: true, message: 'Password changed successfully' });
  } catch (error) {
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });
    
    handleResponse(res, 200, { success: true, user });
  } catch (error) {
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id);
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await models.User.findOne({ where: { email } });
      if (emailExists) {
        return handleResponse(res, 400, { success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    const updatedUser = await user.save();
    handleResponse(res, 200, { success: true, user: updatedUser });
  } catch (error) {
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.checkAuthStatus = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return handleResponse(res, 401, { isAuthenticated: false });
    }
    handleResponse(res, 200, { isAuthenticated: true, user });
  } catch (error) {
    handleResponse(res, 500, { success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  handleResponse(res, 200, { success: true, message: 'Logged out successfully' });
};

module.exports = exports;