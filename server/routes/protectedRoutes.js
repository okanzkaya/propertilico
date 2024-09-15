// server/routes/protectedRoutes.js

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { updateSubscriptionEndDate } = require('../utils/subscriptionUtils');
const User = require('../models/User');
const propertyController = require('../controllers/propertyController');

// Apply protection middleware to all routes
router.use(protect);

// Get user data
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

// Update user profile
router.put('/user', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      subscriptionEndDate: updatedUser.subscriptionEndDate
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

// Extend subscription (admin only)
router.post('/extend-subscription', admin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.subscriptionEndDate = updateSubscriptionEndDate(user.subscriptionEndDate, 7);
    await user.save();
    console.log(`Subscription extended for user ${user._id} by admin ${req.user._id}`);
    res.json({ subscriptionEndDate: user.subscriptionEndDate });
  } catch (error) {
    console.error('Error extending subscription:', error);
    res.status(500).json({ message: 'Failed to extend subscription' });
  }
});

// Reduce subscription (admin only)
router.post('/reduce-subscription', admin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.subscriptionEndDate = updateSubscriptionEndDate(user.subscriptionEndDate, -7);
    await user.save();
    console.log(`Subscription reduced for user ${user._id} by admin ${req.user._id}`);
    res.json({ subscriptionEndDate: user.subscriptionEndDate });
  } catch (error) {
    console.error('Error reducing subscription:', error);
    res.status(500).json({ message: 'Failed to reduce subscription' });
  }
});

// Get subscription details
router.get('/subscription', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscriptionEndDate');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ subscriptionEndDate: user.subscriptionEndDate });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ message: 'Failed to fetch subscription details' });
  }
});

// Property routes
router.post('/properties', propertyController.createProperty);
router.get('/properties', propertyController.getUserProperties);
router.get('/properties/:id', propertyController.getPropertyById);
router.put('/properties/:id', propertyController.updateProperty);
router.delete('/properties/:id', propertyController.deleteProperty);

module.exports = router;