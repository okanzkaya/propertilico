const { Blog, User } = require('../config/db');
const { Op } = require('sequelize');

exports.getAllBlogs = async (req, res, next) => {
  try {
    console.log('Fetching blogs with params:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';

    const order = sort === 'oldest' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { excerpt: { [Op.iLike]: `%${search}%` } },
        ]
      },
      order,
      limit,
      offset,
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
    });

    console.log(`Found ${count} blogs`);

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalBlogs: count
    });
  } catch (err) {
    console.error('Error in getAllBlogs:', err);
    next(err);
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
    });
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(blog);
  } catch (err) {
    next(err);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, tags } = req.body;
    
    // Ensure tags is always an array
    const processedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      tags: processedTags,
      authorId: req.user.id
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error('Error in createBlog:', error);
    next(error);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }
    const updatedBlog = await blog.update(req.body);
    res.json(updatedBlog);
  } catch (err) {
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }
    await blog.destroy();
    res.json({ message: 'Blog removed' });
  } catch (err) {
    next(err);
  }
};

exports.getUserBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.findAll({
      where: { authorId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
    });
    res.json(blogs);
  } catch (err) {
    next(err);
  }
};