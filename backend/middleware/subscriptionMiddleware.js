const subscriptionMiddleware = (req, res, next) => {
  if (!req.user.subscriptionEndDate || new Date(req.user.subscriptionEndDate) < new Date()) {
    return res.status(403).json({ message: 'Subscription required or expired' });
  }
  next();
};

module.exports = subscriptionMiddleware;
