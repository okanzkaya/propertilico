const express = require('express');
const { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect, isBlogger } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', protect, isBlogger, createBlog);
router.put('/:id', protect, isBlogger, updateBlog);
router.delete('/:id', protect, isBlogger, deleteBlog);

module.exports = router;