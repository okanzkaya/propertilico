// routes/blogRoutes.js
const express = require('express');
const blogController = require('../controllers/blogController');
const { protect, isBlogger } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to safely use controller methods
const safeController = (controllerFn) => (req, res, next) => {
  if (typeof controllerFn === 'function') {
    return controllerFn(req, res, next);
  }
  next(new Error(`Controller function not implemented`));
};

// Public routes
router.get('/', safeController(blogController.getAllBlogs));
router.get('/:id', safeController(blogController.getBlogById));

// Protected routes
router.use(protect);

// Blogger-only routes
router.post('/', isBlogger, safeController(blogController.createBlog));
router.put('/:id', isBlogger, safeController(blogController.updateBlog));
router.delete('/:id', isBlogger, safeController(blogController.deleteBlog));
router.get('/user/blogs', isBlogger, safeController(blogController.getUserBlogs));

// Conditionally add routes if the controller functions exist
if (typeof blogController.searchBlogs === 'function') {
  router.get('/search', safeController(blogController.searchBlogs));
}

if (typeof blogController.getLatestBlogs === 'function') {
  router.get('/latest', safeController(blogController.getLatestBlogs));
}

if (typeof blogController.getBlogsByTag === 'function') {
  router.get('/tag/:tag', safeController(blogController.getBlogsByTag));
}

module.exports = router;