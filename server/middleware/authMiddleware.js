// authMiddleware.js
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
  return user.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date();
};

const isExemptRoute = (url) => {
  const exemptRoutes = [
    '/api/user/profile',
    '/api/user/subscription',
    '/api/user/extend-subscription',
    '/api/user/reduce-subscription',
    '/api/user/get-one-month-subscription',
    '/api/auth/status'
  ];
  return exemptRoutes.some(route => url.includes(route));
};

const refreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

    const hasActiveSubscription = checkSubscription(user);
    if (!hasActiveSubscription && !isExemptRoute(req.originalUrl) && req.originalUrl.startsWith('/api/')) {
      console.log('User subscription check failed');
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
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized for this action' });
    }
  };
};

const isBlogger = (req, res, next) => {
  if (req.user && req.user.isBlogger) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a blogger' });
  }
};

module.exports = { protect, admin, checkRole, isBlogger, refreshToken };