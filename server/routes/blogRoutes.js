// blogRoutes.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, isBlogger } = require('../middleware/authMiddleware');

// Public routes - no authentication required
router.get('/', blogController.getAllBlogs);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/tags', blogController.getPopularTags);
router.get('/tag/:tag', blogController.getBlogsByTag);
router.get('/related/:id', blogController.getRelatedBlogs); // Made public
router.get('/:id', blogController.getBlogById);

// Protected routes - require authentication
router.use(protect);

// Blogger-only routes
router.post('/', isBlogger, blogController.createBlog);
router.put('/:id', isBlogger, blogController.updateBlog);
router.delete('/:id', isBlogger, blogController.deleteBlog);
router.get('/user/blogs', isBlogger, blogController.getUserBlogs);

// Stats routes (protected)
router.get('/stats/author', blogController.getAuthorStats);
router.get('/stats/blog', blogController.getBlogStats);

module.exports = router;