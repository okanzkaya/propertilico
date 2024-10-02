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
    const newBlog = await Blog.create({
      ...req.body,
      author: req.user.name,
      userId: req.user._id
    });
    res.status(201).json(newBlog);
  } catch (err) {
    next(new Error('Failed to create blog post'));
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBlog);
  } catch (err) {
    next(new Error('Failed to update blog post'));
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }
    await blog.remove();
    res.json({ message: 'Blog removed' });
  } catch (err) {
    next(new Error('Failed to delete blog post'));
  }
};