const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { updateSubscriptionEndDate } = require('../utils/subscriptionUtils');
const User = require('../models/userModel');

router.use(authMiddleware);

router.get('/user', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/extend-subscription', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.subscriptionEndDate = updateSubscriptionEndDate(user.subscriptionEndDate, 7);
    await user.save();
    res.json({ subscriptionEndDate: user.subscriptionEndDate });
  } catch {
    res.status(500).json({ message: 'Failed to extend subscription' });
  }
});

router.post('/reduce-subscription', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.subscriptionEndDate = updateSubscriptionEndDate(user.subscriptionEndDate, -7);
    await user.save();
    res.json({ subscriptionEndDate: user.subscriptionEndDate });
  } catch {
    res.status(500).json({ message: 'Failed to reduce subscription' });
  }
});

module.exports = router;
