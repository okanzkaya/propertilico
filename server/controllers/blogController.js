const Blog = require('../models/Blog');
const User = require('../models/User');

exports.getAllBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    
    const blogs = await Blog.find()
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'name');
    
    const total = await Blog.countDocuments();

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    next(new Error('Failed to fetch blog posts'));
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(blog);
  } catch (err) {
    next(new Error('Failed to fetch blog post'));
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const newBlog = new Blog({
      ...req.body,
      author: req.user._id
    });
    await newBlog.save();
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
    if (blog.author.toString() !== req.user._id.toString()) {
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
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }
    await blog.remove();
    res.json({ message: 'Blog removed' });
  } catch (err) {
    next(new Error('Failed to delete blog post'));
  }
};
