const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');
const { validateFeedback } = require('../utils/validation');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many feedback submissions, please try again later.'
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'feedbacks');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uuidv4()}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|heic|mp4|webm|ogg|mp3|wav/;
  const isAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && 
                    allowedTypes.test(file.mimetype);
  if (isAllowed) return cb(null, true);
  cb(new Error('Only images, videos, and audio files are allowed.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
}).single('attachment');

const generateSecureFileName = (originalName) => {
  return `${crypto.randomBytes(16).toString('hex')}${path.extname(originalName)}`;
};

// Check feedback limit
router.get('/check-limit', protect, subscriptionMiddleware, async (req, res) => {
  try {
    const lastFeedback = await Feedback.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    
    if (!lastFeedback || lastFeedback.createdAt < fiveMinutesAgo) {
      res.json({ canSubmit: true, timeUntilNext: 0 });
    } else {
      const timeUntilNext = Math.ceil((lastFeedback.createdAt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000);
      res.json({ canSubmit: false, timeUntilNext });
    }
  } catch (error) {
    console.error('Error checking feedback limit:', error);
    res.status(500).json({ message: 'Error checking feedback limit' });
  }
});

// Submit feedback
router.post('/', protect, subscriptionMiddleware, limiter, (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'An error occurred while uploading the file' });
    }

    try {
      const { message, rating, feedbackType } = req.body;
      
      // Validate feedback
      const { error } = validateFeedback({ message, rating, feedbackType });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      let attachment = null;
      if (req.file) {
        const secureFileName = generateSecureFileName(req.file.originalname);
        const newPath = path.join(uploadsDir, secureFileName);
        await fs.rename(req.file.path, newPath);
        attachment = `/uploads/feedbacks/${secureFileName}`;
      }

      const newFeedback = await Feedback.create({
        userId: req.user.id,
        message,
        rating: rating || 0,
        feedbackType,
        attachment
      });

      res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Error submitting feedback' });
    }
  });
});

// Get all feedback (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Get single feedback by ID (admin only)
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Update feedback (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFavorite, isRead } = req.body;

    const [updatedRows] = await Feedback.update(
      { isFavorite, isRead },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const updatedFeedback = await Feedback.findByPk(id);
    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Error updating feedback' });
  }
});

// Delete feedback (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.attachment) {
      const filePath = path.join(__dirname, '..', feedback.attachment);
      await fs.unlink(filePath).catch(console.error);
    }

    await feedback.destroy();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Error deleting feedback' });
  }
});

module.exports = router;