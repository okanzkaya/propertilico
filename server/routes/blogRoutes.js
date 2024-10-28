const express = require('express');
const router = express.Router();
const { protect, isBlogger } = require('../middleware/authMiddleware');
const blogController = require('../controllers/blogController');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const AppError = require('../utils/appError');

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif|webp/;
const UPLOAD_PATH = 'uploads/blog-images';

// Ensure upload directory exists
const initializeUploadDirectory = async () => {
  try {
    const uploadDir = path.join(__dirname, '..', UPLOAD_PATH);
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('Blog images upload directory initialized:', uploadDir);
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw error;
  }
};

// Initialize upload directory
initializeUploadDirectory().catch(console.error);

// Generate unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname).toLowerCase();
  return `${timestamp}-${randomString}${extension}`;
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', UPLOAD_PATH);
    try {
      await fs.access(uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
  const extname = ALLOWED_FILE_TYPES.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpg, jpeg, png, gif, webp) are allowed!', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
});

// Error handler middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next(err);
};

// Clean up old image middleware
const cleanupOldImage = async (req, res, next) => {
  if (!req.file || !req.params.id) return next();

  try {
    const blog = await req.app.get('models').Blog.findByPk(req.params.id);
    if (blog && blog.imageUrl) {
      const oldImagePath = path.join(__dirname, '..', blog.imageUrl);
      try {
        await fs.access(oldImagePath);
        await fs.unlink(oldImagePath);
        console.log('Old image deleted:', oldImagePath);
      } catch (error) {
        console.log('No old image found to delete');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createBlogLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 posts per hour
  message: 'Too many blog posts created from this IP, please try again after an hour'
});

// Cache configuration
const cache = require('memory-cache');
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = `__blog_${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse && process.env.NODE_ENV === 'production') {
      return res.json(cachedResponse);
    } else {
      res.originalJson = res.json;
      res.json = (body) => {
        cache.put(key, body, duration * 1000);
        res.originalJson(body);
      };
      next();
    }
  };
};

// Routes
// Public routes
router.get(
  '/blogs',
  cacheMiddleware(300), // Cache for 5 minutes
  blogController.getAllBlogs
);

router.get(
  '/blogs/:id',
  cacheMiddleware(300),
  blogController.getBlogById
);

router.get(
  '/blogs/tag/:tag',
  cacheMiddleware(300),
  blogController.getBlogsByTag
);

router.get(
  '/blogs/related/:id',
  cacheMiddleware(300),
  blogController.getRelatedBlogs
);

// Protected routes (require authentication and blogger role)
router.use(protect);

// Routes that require blogger role
router.post(
  '/blogs',
  isBlogger,
  createBlogLimiter,
  upload.single('image'),
  handleMulterError,
  blogController.createBlog
);

router.put(
  '/blogs/:id',
  isBlogger,
  upload.single('image'),
  handleMulterError,
  cleanupOldImage,
  blogController.updateBlog
);

router.delete(
  '/blogs/:id',
  isBlogger,
  cleanupOldImage,
  blogController.deleteBlog
);

// Featured posts management (admin only)
router.patch(
  '/blogs/:id/featured',
  isBlogger,
  async (req, res, next) => {
    try {
      const blog = await req.app.get('models').Blog.findByPk(req.params.id);
      if (!blog) {
        return next(new AppError('Blog not found', 404));
      }
      await blog.toggleFeatured();
      res.json({
        status: 'success',
        data: { featured: blog.isFeaturePost }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Blog route error:', err);

  // Cleanup uploaded file if there's an error
  if (req.file) {
    const filePath = path.join(__dirname, '..', UPLOAD_PATH, req.file.filename);
    fs.unlink(filePath).catch(console.error);
  }

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = router;