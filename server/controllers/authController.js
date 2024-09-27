const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateTokens = (id) => ({
  token: jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
});

const handleResponse = (res, status, data) => res.status(status).json(data);

const handleError = (res, error, defaultMessage) => {
  console.error('Auth controller error:', error);
  handleResponse(res, 500, { message: defaultMessage });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return handleResponse(res, 400, { message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      subscriptionEndDate: new Date(Date.now() + 30*24*60*60*1000),
      maxProperties: 5
    });

    const tokens = generateTokens(user._id);
    handleResponse(res, 201, {
      _id: user._id,
      name: user.name,
      email: user.email,
      ...tokens,
      subscriptionEndDate: user.subscriptionEndDate,
      maxProperties: user.maxProperties
    });
  } catch (error) {
    handleError(res, error, 'Server error during registration');
  }
};

exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await user.matchPassword(password)) {
      const tokens = generateTokens(user._id);
      return handleResponse(res, 200, {
        _id: user._id,
        name: user.name,
        email: user.email,
        ...tokens,
        subscriptionEndDate: user.subscriptionEndDate,
        maxProperties: user.maxProperties
      });
    }
    handleResponse(res, 401, { message: 'Invalid email or password' });
  } catch (error) {
    handleError(res, error, 'Server error during authentication');
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return handleResponse(res, 401, { message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return handleResponse(res, 404, { message: 'User not found' });

    const newTokens = generateTokens(user._id);
    handleResponse(res, 200, newTokens);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return handleResponse(res, 403, { message: 'Invalid refresh token' });
    }
    handleError(res, error, 'Server error during token refresh');
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return handleResponse(res, 404, { message: 'User not found' });
    
    handleResponse(res, 200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      subscriptionEndDate: user.subscriptionEndDate,
      maxProperties: user.maxProperties
    });
  } catch (error) {
    handleError(res, error, 'Error fetching user profile');
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return handleResponse(res, 404, { message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 12);
    }

    const updatedUser = await user.save();
    handleResponse(res, 200, {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      maxProperties: updatedUser.maxProperties
    });
  } catch (error) {
    handleError(res, error, 'Failed to update user profile');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return handleResponse(res, 404, { message: 'User not found' });

    if (!await user.matchPassword(oldPassword)) {
      return handleResponse(res, 400, { message: 'Old password is incorrect' });
    }

    if (user.lastPasswordChange && (new Date() - user.lastPasswordChange) < 30 * 60 * 1000) {
      return handleResponse(res, 400, { message: 'You can only change your password once every 30 minutes' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.lastPasswordChange = new Date();
    await user.save();

    handleResponse(res, 200, { message: 'Password changed successfully' });
  } catch (error) {
    handleError(res, error, 'Server error during password change');
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return handleResponse(res, 404, { message: 'User not found' });

    if (!await user.matchPassword(password)) {
      return handleResponse(res, 400, { message: 'Password is incorrect' });
    }

    if (user.lastEmailChange && (new Date() - user.lastEmailChange) < 24 * 60 * 60 * 1000) {
      return handleResponse(res, 400, { message: 'You can only change your email once every 24 hours' });
    }

    if (await User.findOne({ email: newEmail })) {
      return handleResponse(res, 400, { message: 'Email is already in use' });
    }

    user.email = newEmail;
    user.lastEmailChange = new Date();
    await user.save();

    handleResponse(res, 200, { message: 'Email changed successfully' });
  } catch (error) {
    handleError(res, error, 'Server error during email change');
  }
};