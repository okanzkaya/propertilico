const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = '15m') => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      subscriptionEndDate: new Date(Date.now() + 30*24*60*60*1000),
      maxProperties: 5 // Default to 5 properties for new users
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      subscriptionEndDate: user.subscriptionEndDate,
      maxProperties: user.maxProperties
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await user.matchPassword(password)) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
        subscriptionEndDate: user.subscriptionEndDate,
        maxProperties: user.maxProperties
      });
    }
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAccessToken = generateToken(user._id);
    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      subscriptionEndDate: user.subscriptionEndDate,
      maxProperties: user.maxProperties
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      maxProperties: updatedUser.maxProperties
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user profile' });
  }
};

module.exports = { 
  registerUser, 
  authUser, 
  refreshAccessToken, 
  getUserProfile, 
  updateUserProfile 
};