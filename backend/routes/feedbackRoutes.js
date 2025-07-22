const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { models } = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateFeedback } = require('../utils/validation');

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif|heic|mp4|webm|ogg|mp3|wav/;
const FEEDBACK_COOLDOWN = 5 * 60 * 1000; // 5 minutes

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'feedbacks');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Multer configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowed = ALLOWED_FILE_TYPES.test(ext) && 
                   ALLOWED_FILE_TYPES.test(file.mimetype);
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// Submit new feedback
router.post('/', protect, upload.single('attachment'), async (req, res) => {
  try {
    const { message, rating = 0, feedbackType } = req.body;

    // Validate feedback data
    const { error } = validateFeedback({ 
      message: message?.trim(), 
      rating: parseInt(rating) || 0,
      feedbackType 
    });

    if (error) {
      // Delete uploaded file if validation fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check cooldown period
    const lastFeedback = await models.Feedback.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    if (lastFeedback) {
      const timeSinceLastFeedback = Date.now() - lastFeedback.createdAt.getTime();
      if (timeSinceLastFeedback < FEEDBACK_COOLDOWN) {
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(429).json({
          message: `Please wait ${Math.ceil((FEEDBACK_COOLDOWN - timeSinceLastFeedback) / 1000)} seconds before submitting another feedback`
        });
      }
    }

    // Create feedback entry
    const newFeedback = await models.Feedback.create({
      userId: req.user.id,
      message: message.trim(),
      rating: parseInt(rating) || 0,
      feedbackType,
      attachment: req.file ? `/uploads/feedbacks/${req.file.filename}` : null
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    });

  } catch (error) {
    // Clean up uploaded file if there was an error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

// Rest of your routes remain the same...
// Get feedback
router.get('/', protect, admin, async (req, res) => {
  try {
    const feedback = await models.Feedback.findAll({
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Check feedback limit
router.get('/check-limit', protect, async (req, res) => {
  try {
    const lastFeedback = await models.Feedback.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    const now = new Date();
    const cooldownTime = new Date(now - FEEDBACK_COOLDOWN);
    
    if (!lastFeedback || lastFeedback.createdAt < cooldownTime) {
      return res.json({ canSubmit: true, timeUntilNext: 0 });
    }

    const timeUntilNext = Math.ceil(
      (lastFeedback.createdAt.getTime() + FEEDBACK_COOLDOWN - now.getTime()) / 1000
    );
    res.json({ canSubmit: false, timeUntilNext });
  } catch (error) {
    console.error('Error checking feedback limit:', error);
    res.status(500).json({ message: 'Error checking feedback limit' });
  }
});

module.exports = router;