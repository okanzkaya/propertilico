const jwt = require('jsonwebtoken');
const { models } = require('../config/db');

const verifyToken = token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

const checkSubscription = user => {
  if (!user.subscriptionEndDate) {
    console.log('User has no subscription end date');
    return false;
  }
  const isActive = new Date(user.subscriptionEndDate) > new Date();
  console.log(`User subscription active: ${isActive}`);
  return isActive;
};

const isExemptRoute = url => {
  const exemptRoutes = [
    '/api/user/profile',
    '/api/user/subscription',
    '/api/user/extend-subscription',
    '/api/user/reduce-subscription',
    '/api/user/get-one-month-subscription',
    '/api/auth/status'
  ];
  const isExempt = exemptRoutes.some(route => url.includes(route));
  console.log(`Route ${url} is exempt: ${isExempt}`);
  return isExempt;
};

const protect = async (req, res, next) => {
  console.log(`Protecting route: ${req.originalUrl}`);
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in Authorization header');
  }

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Invalid token');
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const user = await models.User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    if (!isExemptRoute(req.originalUrl) && !checkSubscription(user)) {
      console.log('User subscription inactive');
      return res.status(403).json({ message: 'Subscription required', redirect: '/my-plan' });
    }

    req.user = user;
    console.log(`User authenticated: ${user.id}`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    console.log(`Admin access granted to user: ${req.user.id}`);
    next();
  } else {
    console.log(`Admin access denied to user: ${req.user ? req.user.id : 'unknown'}`);
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const checkRole = roles => (req, res, next) => {
  if (!req.user) {
    console.log('User not authenticated for role check');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (roles.includes(req.user.role)) {
    console.log(`Role ${req.user.role} authorized for user: ${req.user.id}`);
    next();
  } else {
    console.log(`Role ${req.user.role} not authorized for user: ${req.user.id}`);
    res.status(403).json({ message: 'Not authorized for this action' });
  }
};

const isBlogger = (req, res, next) => {
  if (req.user && req.user.isBlogger) {
    console.log(`Blogger access granted to user: ${req.user.id}`);
    next();
  } else {
    console.log(`Blogger access denied to user: ${req.user ? req.user.id : 'unknown'}`);
    res.status(403).json({ message: 'Not authorized as a blogger' });
  }
};

module.exports = { protect, admin, checkRole, isBlogger };