const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateSubscriptionEndDate } = require('../utils/subscriptionUtils');
const User = require('../models/userModel');

router.use(protect);

router.get('/user', async (req, res) => {
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
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/extend-subscription', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.subscriptionEndDate = updateSubscriptionEndDate(user.subscriptionEndDate, 7);
    await user.save();
    res.json({ subscriptionEndDate: user.subscriptionEndDate });
  } catch (error) {
    console.error('Error extending subscription:', error);
    res.status(500).json({ message: 'Failed to extend subscription' });
  }
});

router.post('/reduce-subscription', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.subscriptionEndDate = updateSubscriptionEndDate(user.subscriptionEndDate, -7);
    await user.save();
    res.json({ subscriptionEndDate: user.subscriptionEndDate });
  } catch (error) {
    console.error('Error reducing subscription:', error);
    res.status(500).json({ message: 'Failed to reduce subscription' });
  }
});

module.exports = router;