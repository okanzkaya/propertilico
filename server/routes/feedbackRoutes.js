const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const Feedback = require('../models/Feedback');
const { protect, admin } = require('../middleware/authMiddleware');
const crypto = require('crypto');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many feedback submissions, please try again later.'
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads/feedbacks');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uuidv4()}-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|heic|mp4|webm|ogg|mp3|wav/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only images (jpeg, jpg, png, gif, heic), videos (mp4, webm, ogg), and audio (mp3, wav) are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
}).single('attachment');

// Helper function to generate a secure file name
const generateSecureFileName = (originalName) => {
  const fileExtension = path.extname(originalName);
  const randomName = crypto.randomBytes(16).toString('hex');
  return `${randomName}${fileExtension}`;
};

// Check feedback limit
router.get('/check-limit', protect, async (req, res) => {
  try {
    console.log('Checking feedback limit for user:', req.user._id);
    const lastFeedback = await Feedback.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    console.log('Last feedback:', lastFeedback);
    
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    
    if (!lastFeedback || lastFeedback.createdAt < fiveMinutesAgo) {
      console.log('User can submit feedback');
      res.json({ canSubmit: true, timeUntilNext: 0 });
    } else {
      const timeUntilNext = Math.ceil((lastFeedback.createdAt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000);
      console.log('User must wait', timeUntilNext, 'seconds');
      res.json({ canSubmit: false, timeUntilNext });
    }
  } catch (error) {
    console.error('Error checking feedback limit:', error);
    res.status(500).json({ message: 'Error checking feedback limit', error: error.toString() });
  }
});

// Submit feedback
router.post('/', protect, limiter, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      const { message, rating, feedbackType } = req.body;
      let attachment = null;

      if (req.file) {
        const secureFileName = generateSecureFileName(req.file.originalname);
        const newPath = path.join(uploadsDir, secureFileName);
        await fs.rename(req.file.path, newPath);
        attachment = `/uploads/feedbacks/${secureFileName}`;
      }

      const newFeedback = new Feedback({
        user: req.user._id,
        message,
        rating: rating || 0,
        feedbackType,
        attachment
      });

      await newFeedback.save();
      res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Error submitting feedback', error: error.toString() });
    }
  });
});

// Get all feedback (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('user', 'name email');
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.toString() });
  }
});

// Get single feedback by ID (admin only)
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('user', 'name email');
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.toString() });
  }
});

// Update feedback (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFavorite, isRead } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { isFavorite, isRead },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Error updating feedback', error: error.toString() });
  }
});

// Delete feedback (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Delete the associated file if it exists
    if (deletedFeedback.attachment) {
      const filePath = path.join(__dirname, '..', deletedFeedback.attachment);
      await fs.unlink(filePath);
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Error deleting feedback', error: error.toString() });
  }
});

module.exports = router;