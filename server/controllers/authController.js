const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = '15m') => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, subscriptionEndDate: new Date(Date.now() + 30*24*60*60*1000) });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      subscriptionEndDate: user.subscriptionEndDate,
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

module.exports = { registerUser, authUser, refreshAccessToken };