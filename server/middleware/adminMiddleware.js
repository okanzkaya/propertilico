const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

const checkSubscription = (user) => {
  if (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) < new Date()) {
    console.log('User subscription expired or not found');
    return false;
  }
  return true;
};

const protect = async (req, res, next) => {
  console.log('Authenticating request to:', req.originalUrl);
  
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in request');
  }

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Not authorized, no token provided', redirect: '/signin' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token', redirect: '/signin' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'User not found', redirect: '/signin' });
    }

    if (!checkSubscription(user)) {
      return res.status(403).json({ message: 'Access denied. Active subscription required.', redirect: '/my-plan' });
    }

    req.user = user;
    console.log('User authenticated:', user.email);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', tokenExpired: true, redirect: '/signin' });
    } else {
      return res.status(401).json({ message: 'Not authorized', redirect: '/signin' });
    }
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    console.log('Admin access granted to:', req.user.email);
    next();
  } else {
    console.log('Admin access denied to:', req.user ? req.user.email : 'unknown user');
    const error = new Error('Not authorized as an admin');
    error.statusCode = 403;
    next(error);
  }
};

module.exports = { protect, admin };