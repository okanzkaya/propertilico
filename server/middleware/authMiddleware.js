const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Received token:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('User not found for id:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User authenticated:', user._id);
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(401).json({ message: 'Not authorized, authentication failed' });
    }
  } else {
    console.log('No token provided');
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };