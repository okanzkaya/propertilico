const { models } = require('../config/db');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const path = require('path');
const fs = require('fs').promises;

// Performance optimization - Memoize common operations
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Security Configuration
const SANITIZE_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'
  ],
  allowedAttributes: {
    'a': ['href', 'name', 'target'],
    'img': ['src', 'alt', 'title'],
    '*': ['style', 'class']
  },
  allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data']
  }
};

// Image processing utility
const processImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  // If it's already a complete URL, return it
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Ensure the path starts with /uploads/blog-images/
  if (!imageUrl.startsWith('/uploads/blog-images/')) {
    return `/uploads/blog-images/${imageUrl.replace(/^\/+/, '')}`;
  }

  return imageUrl;
};

// Delete image utility
const deleteImageFile = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const imagePath = path.join(__dirname, '..', imageUrl);
    await fs.access(imagePath); // Check if file exists
    await fs.unlink(imagePath);
    console.log('Successfully deleted image:', imagePath);
  } catch (error) {
    console.error('Error deleting image file:', error);
    // Don't throw error - just log it
  }
};

// Utility functions
const sanitizeContent = memoize((content) => sanitizeHtml(content, SANITIZE_OPTIONS));

const createSlug = memoize((title) => 
  slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })
);

const validateBlogData = ({ title, content, excerpt }) => {
  const errors = [];
  if (!title?.trim() || title.length < 3) errors.push('Title must be at least 3 characters');
  if (!content?.trim() || content.length < 100) errors.push('Content must be at least 100 characters');
  if (!excerpt?.trim() || excerpt.length < 10 || excerpt.length > 300) {
    errors.push('Excerpt must be between 10 and 300 characters');
  }
  return errors;
};

// Controller Methods
exports.getAllBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim() || '';
    const sort = req.query.sort || 'newest';

    const whereClause = {
      status: 'published',
      ...(search && {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { excerpt: { [Op.iLike]: `%${search}%` } },
        ]
      })
    };

    console.log('Fetching blogs with query:', whereClause);

    const { count, rows: blogs } = await models.Blog.findAndCountAll({
      where: whereClause,
      order: [['created_at', sort === 'newest' ? 'DESC' : 'ASC']],
      limit,
      offset,
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription']
      }],
      distinct: true
    });

    console.log('Blogs with images:', blogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      imageUrl: blog.imageUrl
    })));

    const processedBlogs = blogs.map(blog => {
      const plainBlog = blog.get({ plain: true });
      return {
        ...plainBlog,
        imageUrl: processImageUrl(plainBlog.imageUrl)
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        blogs: processedBlogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalBlogs: count,
          blogsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllBlogs:', error);
    next(new AppError('Failed to fetch blogs', 500));
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await models.Blog.findByPk(req.params.id, {
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription', 'avatar']
      }]
    });

    if (!blog) return next(new AppError('Blog post not found', 404));

    await blog.increment('viewCount', { by: 1 });
    
    const processedBlog = blog.get({ plain: true });
    processedBlog.imageUrl = processImageUrl(processedBlog.imageUrl);

    res.status(200).json({
      status: 'success',
      data: { blog: processedBlog }
    });
  } catch (error) {
    console.error('Error in getBlogById:', error);
    next(new AppError('Failed to fetch blog post', 500));
  }
};

// Update the createBlog function in blogController.js
exports.createBlog = async (req, res, next) => {
  try {
    console.log('Creating blog with data:', req.body);
    console.log('File received:', req.file);

    const { title, content, excerpt, status = 'published' } = req.body;
    let tags = [];
    
    try {
      tags = JSON.parse(req.body.tags || '[]');
    } catch (e) {
      console.error('Error parsing tags:', e);
      tags = [];
    }

    const validationErrors = validateBlogData({ title, content, excerpt });
    if (validationErrors.length) {
      if (req.file) {
        await deleteImageFile(`/uploads/blog-images/${req.file.filename}`);
      }
      return next(new AppError(validationErrors.join('. '), 400));
    }

    // Process image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/blog-images/${req.file.filename}`;
      console.log('Image URL set to:', imageUrl);
    }

    const blogData = {
      title,
      content: sanitizeContent(content),
      excerpt,
      tags,
      authorId: req.user.id,
      status,
      imageUrl,
      publishedAt: status === 'published' ? new Date() : null
    };

    console.log('Creating blog with processed data:', blogData);

    const blog = await models.Blog.create(blogData);
    console.log('Blog created successfully:', blog.id);

    const blogWithAuthor = await models.Blog.findByPk(blog.id, {
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription']
      }]
    });

    res.status(201).json({
      status: 'success',
      data: { blog: blogWithAuthor }
    });
  } catch (error) {
    console.error('Error in createBlog:', error);
    if (req.file) {
      await deleteImageFile(`/uploads/blog-images/${req.file.filename}`);
    }
    next(new AppError('Failed to create blog post', 500));
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await models.Blog.findByPk(req.params.id);
    if (!blog) return next(new AppError('Blog post not found', 404));
    
    if (blog.authorId !== req.user.id && !req.user.isAdmin) {
      if (req.file) {
        await deleteImageFile(`/uploads/blog-images/${req.file.filename}`);
      }
      return next(new AppError('Not authorized to update this blog', 403));
    }

    const { title, content, excerpt, tags, status } = req.body;

    let imageUrl = blog.imageUrl;
    if (req.file) {
      // Delete old image if it exists
      if (blog.imageUrl) {
        await deleteImageFile(blog.imageUrl);
      }
      imageUrl = `/uploads/blog-images/${req.file.filename}`;
      console.log('New image saved:', imageUrl);
    }

    const fieldsToValidate = {
      title: title || blog.title,
      content: content || blog.content,
      excerpt: excerpt || blog.excerpt
    };
    
    const validationErrors = validateBlogData(fieldsToValidate);
    if (validationErrors.length) {
      if (req.file) {
        await deleteImageFile(imageUrl);
      }
      return next(new AppError(validationErrors.join('. '), 400));
    }

    const updateData = {
      ...(title && { title, slug: createSlug(title) }),
      ...(content && { content: sanitizeContent(content) }),
      ...(excerpt && { excerpt }),
      ...(tags && { 
        tags: Array.isArray(tags) 
          ? tags 
          : tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }),
      ...(status && { 
        status,
        publishedAt: status === 'published' && blog.status !== 'published' 
          ? new Date() 
          : blog.publishedAt
      }),
      imageUrl
    };

    await blog.update(updateData);
    
    const updatedBlog = await models.Blog.findByPk(blog.id, {
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription']
      }]
    });

    console.log('Updated blog:', {
      id: blog.id,
      title: blog.title,
      imageUrl: blog.imageUrl
    });

    res.status(200).json({
      status: 'success',
      data: { blog: updatedBlog }
    });
  } catch (error) {
    console.error('Error in updateBlog:', error);
    if (req.file) {
      await deleteImageFile(`/uploads/blog-images/${req.file.filename}`);
    }
    next(new AppError('Failed to update blog post', 500));
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await models.Blog.findByPk(req.params.id);
    if (!blog) return next(new AppError('Blog post not found', 404));

    if (blog.authorId !== req.user.id && !req.user.isAdmin) {
      return next(new AppError('Not authorized to delete this blog', 403));
    }

    if (blog.imageUrl) {
      await deleteImageFile(blog.imageUrl);
    }

    await blog.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteBlog:', error);
    next(new AppError('Failed to delete blog post', 500));
  }
};

exports.getRelatedBlogs = async (req, res, next) => {
  try {
    const blog = await models.Blog.findByPk(req.params.id);
    if (!blog) return next(new AppError('Blog post not found', 404));

    const relatedBlogs = await models.Blog.findAll({
      where: {
        id: { [Op.ne]: blog.id },
        status: 'published',
        tags: { [Op.overlap]: blog.tags }
      },
      limit: 3,
      order: [['publishedAt', 'DESC']],
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription']
      }],
      attributes: {
        exclude: ['content']
      }
    });

    const processedBlogs = relatedBlogs.map(blog => ({
      ...blog.get({ plain: true }),
      imageUrl: processImageUrl(blog.imageUrl)
    }));

    res.status(200).json({
      status: 'success',
      data: { relatedBlogs: processedBlogs }
    });
  } catch (error) {
    console.error('Error in getRelatedBlogs:', error);
    next(new AppError('Failed to fetch related blogs', 500));
  }
};

exports.getBlogsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const { count, rows: blogs } = await models.Blog.findAndCountAll({
      where: {
        status: 'published',
        tags: { [Op.contains]: [tag] }
      },
      limit,
      offset: (page - 1) * limit,
      order: [['publishedAt', 'DESC']],
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription']
      }],
      attributes: {
        exclude: ['content']
      }
    });

    const processedBlogs = blogs.map(blog => ({
      ...blog.get({ plain: true }),
      imageUrl: processImageUrl(blog.imageUrl)
    }));

    res.status(200).json({
      status: 'success',
      data: {
        blogs: processedBlogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalBlogs: count,
          blogsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error in getBlogsByTag:', error);
    next(new AppError('Failed to fetch blogs by tag', 500));
  }
};

module.exports = {
  getAllBlogs: exports.getAllBlogs,
  getBlogById: exports.getBlogById,
  createBlog: exports.createBlog,
  updateBlog: exports.updateBlog,
  deleteBlog: exports.deleteBlog,
  getRelatedBlogs: exports.getRelatedBlogs,
  getBlogsByTag: exports.getBlogsByTag
};
