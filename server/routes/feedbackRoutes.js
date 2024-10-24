const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { models } = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');
const { validateFeedback } = require('../utils/validation');
const crypto = require('crypto');

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif|heic|mp4|webm|ogg|mp3|wav/;
const FEEDBACK_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many feedback submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'feedbacks');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isAllowed = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase()) && 
                    ALLOWED_FILE_TYPES.test(file.mimetype);
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, and audio files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
}).single('attachment');

// Helper functions
const generateSecureFileName = (originalName) => {
  return `${crypto.randomBytes(16).toString('hex')}${path.extname(originalName)}`;
};

const handleFileUpload = async (req) => {
  return new Promise((resolve, reject) => {
    upload(req, null, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          reject({ status: 400, message: err.message });
        } else {
          reject({ status: 500, message: 'Error uploading file' });
        }
      }
      resolve(req.file);
    });
  });
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw - file deletion failure shouldn't break the main operation
  }
};

// Routes

// Check feedback submission limit
router.get('/check-limit', protect, subscriptionMiddleware, async (req, res) => {
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

// Submit new feedback
router.post('/', protect, subscriptionMiddleware, limiter, async (req, res) => {
  let uploadedFile = null;
  try {
    // Handle file upload if present
    if (req.files || req.file) {
      uploadedFile = await handleFileUpload(req);
    }

    const { message, rating, feedbackType } = req.body;
    
    // Validate feedback data
    const { error } = validateFeedback({ message, rating, feedbackType });
    if (error) {
      if (uploadedFile) {
        await deleteFile(uploadedFile.path);
      }
      return res.status(400).json({ message: error.details[0].message });
    }

    // Process attachment if present
    let attachment = null;
    if (uploadedFile) {
      const secureFileName = generateSecureFileName(uploadedFile.originalname);
      const newPath = path.join(uploadsDir, secureFileName);
      await fs.rename(uploadedFile.path, newPath);
      attachment = `/uploads/feedbacks/${secureFileName}`;
    }

    // Create feedback entry
    const newFeedback = await models.Feedback.create({
      userId: req.user.id,
      message,
      rating: rating || 0,
      feedbackType,
      attachment
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    });
  } catch (error) {
    // Clean up uploaded file if there was an error
    if (uploadedFile) {
      await deleteFile(uploadedFile.path);
    }
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

// Get all feedback (admin only)
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

// Get single feedback by ID (admin only)
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }

    const feedback = await models.Feedback.findByPk(id, {
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['name', 'email']
      }]
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
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }

    const feedback = await models.Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const { isFavorite, isRead } = req.body;
    const updateData = {};
    
    if (typeof isFavorite === 'boolean') updateData.isFavorite = isFavorite;
    if (typeof isRead === 'boolean') updateData.isRead = isRead;

    await feedback.update(updateData);
    
    const updatedFeedback = await models.Feedback.findByPk(id, {
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

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

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }

    const feedback = await models.Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Delete associated attachment if exists
    if (feedback.attachment) {
      const filePath = path.join(__dirname, '..', feedback.attachment);
      await deleteFile(filePath);
    }

    await feedback.destroy();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Error deleting feedback' });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Feedback route error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;