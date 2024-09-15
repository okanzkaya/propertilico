const Blog = require('../models/Blog');

exports.getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    next(new Error('Failed to fetch blog posts'));
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      const error = new Error('Blog post not found');
      error.status = 404;
      throw error;
    }
    res.json(blog);
  } catch (err) {
    next(err.status === 404 ? err : new Error('Failed to fetch blog post'));
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(201).json(newBlog);
  } catch (err) {
    next(new Error('Failed to create blog post'));
  }
};