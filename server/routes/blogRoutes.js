const express = require('express');
const blogController = require('../controllers/blogController');
const { protect, isBlogger } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Protected routes
router.use(protect);

// Blogger-only routes
router.post('/', isBlogger, blogController.createBlog);
router.put('/:id', isBlogger, blogController.updateBlog);
router.delete('/:id', isBlogger, blogController.deleteBlog);
router.get('/user/blogs', isBlogger, blogController.getUserBlogs);

module.exports = router;