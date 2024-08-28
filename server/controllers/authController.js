const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = '30m') => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password, subscriptionEndDate: new Date(Date.now() + 30*24*60*60*1000) });

  res.status(201).json({
    _id: user._id, name: user.name, email: user.email,
    token: generateToken(user._id), refreshToken: generateRefreshToken(user._id),
    subscriptionEndDate: user.subscriptionEndDate,
  });
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.matchPassword(password)) {
    return res.json({
      _id: user._id, name: user.name, email: user.email,
      token: generateToken(user._id), refreshToken: generateRefreshToken(user._id),
      subscriptionEndDate: user.subscriptionEndDate,
    });
  }
  res.status(401).json({ message: 'Invalid email or password' });
};

const refreshAccessToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ token: generateToken(user._id) });
  });
};

module.exports = { registerUser, authUser, refreshAccessToken };
