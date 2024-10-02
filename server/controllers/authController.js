const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const generateTokens = (id) => ({
  token: jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
});

const handleResponse = (res, status, data) => res.status(status).json(data);

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'An unexpected error occurred';
  handleResponse(res, statusCode, { success: false, message });
};

const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  return ticket.getPayload();
};

const getUserInfo = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const parser = new UAParser(userAgent);
  const geoData = geoip.lookup(ip);

  return {
    ip,
    userAgent,
    browser: parser.getBrowser().name,
    os: parser.getOS().name,
    device: parser.getDevice().type || 'desktop',
    country: geoData ? geoData.country : 'Unknown',
    city: geoData ? geoData.city : 'Unknown',
    timestamp: new Date()
  };
};

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many accounts created from this IP, please try again after an hour'
});

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, captcha } = req.body;

    // Verify reCAPTCHA
    const recaptchaVerification = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`
    );

    if (!recaptchaVerification.data.success) {
      return res.status(400).json({ success: false, message: 'Invalid captcha' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      // Removed: subscriptionEndDate and maxProperties
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        // Removed: subscriptionEndDate and maxProperties from the response
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.authUser = async (req, res) => {
  try {
    const { email, password, reCaptchaToken } = req.body;
    console.log('authController - Login attempt for email:', email);
    console.log('authController - reCAPTCHA token present:', !!reCaptchaToken);
    console.log('authController - Request body:', req.body);
    
    if (!email || !password) {
      console.log('authController - Email or password missing');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
      const recaptchaVerification = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${reCaptchaToken}`
      );
      console.log('authController - reCAPTCHA verification result:', recaptchaVerification.data);

      if (!recaptchaVerification.data.success) {
        console.log('authController - reCAPTCHA verification failed');
        return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
      }
    } catch (recaptchaError) {
      console.error('authController - reCAPTCHA verification error:', recaptchaError);
      return res.status(500).json({ success: false, message: 'Error verifying reCAPTCHA' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('authController - User not found');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('authController - Password does not match');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log('authController - Login successful, sending response');
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
        maxProperties: user.maxProperties
      }
    });
  } catch (error) {
    console.error('authController - Server error during authentication:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred', error: error.message });
  }
};
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return handleResponse(res, 401, { success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });

    const newTokens = generateTokens(user._id);
    handleResponse(res, 200, { success: true, ...newTokens });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return handleResponse(res, 403, { success: false, message: 'Invalid refresh token' });
    }
    handleError(res, error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return handleResponse(res, 404, { success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send email with reset token
    // For development, we'll just return the token
    handleResponse(res, 200, { 
      success: true,
      message: 'Password reset email sent',
      resetToken // Remove this in production
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return handleResponse(res, 400, { success: false, message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    handleResponse(res, 200, { success: true, message: 'Password reset successful' });
  } catch (error) {
    handleError(res, error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
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
    handleError(res, error);
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });
    
    handleResponse(res, 200, {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
        maxProperties: user.maxProperties
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return handleResponse(res, 404, { success: false, message: 'User not found' });

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return handleResponse(res, 400, { success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    const updatedUser = await user.save();
    handleResponse(res, 200, {
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        subscriptionEndDate: updatedUser.subscriptionEndDate,
        maxProperties: updatedUser.maxProperties
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.checkAuthStatus = async (req, res) => {
  try {
    console.log('Checking auth status for user:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ isAuthenticated: false });
    }
    console.log('User found:', user.email);
    res.json({ 
      isAuthenticated: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate
      } 
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.status(500).json({ isAuthenticated: false, message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    // In a stateless JWT setup, we don't need to do anything server-side
    // The client should remove the token from storage
    handleResponse(res, 200, { success: true, message: 'Logged out successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = exports;