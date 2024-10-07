const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

const verifyToken = token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

const checkSubscription = user => user.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date();

const isExemptRoute = url => ['/api/user/profile', '/api/user/subscription', '/api/user/extend-subscription', '/api/user/reduce-subscription', '/api/user/get-one-month-subscription', '/api/auth/status'].some(route => url.includes(route));

const refreshToken = user => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
const admin = (req, res, next) => req.user && req.user.isAdmin ? next() : res.status(403).json({ message: 'Not authorized as an admin' });

const checkRole = roles => (req, res, next) => !req.user ? res.status(401).json({ message: 'Not authenticated' }) : roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Not authorized for this action' });

const isBlogger = (req, res, next) => req.user && req.user.isBlogger ? next() : res.status(403).json({ message: 'Not authorized as a blogger' });

module.exports = { protect, admin, checkRole, isBlogger, refreshToken };