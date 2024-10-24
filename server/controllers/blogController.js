const { models } = require('../config/db');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const { validationResult } = require('express-validator');

// Utility functions
const sanitizeContent = (content) => {
  return sanitizeHtml(content, {
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
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/],
        'font-size': [/^\d+(?:px|em|%)$/]
      }
    }
  });
};

const createSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

const validateBlogData = (data) => {
  const errors = [];
  if (!data.title || data.title.length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  if (!data.content || data.content.length < 100) {
    errors.push('Content must be at least 100 characters long');
  }
  if (!data.excerpt || data.excerpt.length < 10) {
    errors.push('Excerpt must be at least 10 characters long');
  }
  return errors;
};

// Controller Methods
exports.getAllBlogs = async (req, res, next) => {
  try {
    console.log('Getting all blogs with query params:', req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';

    const order = sort === 'oldest' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];

    // Only fetch published blogs for public viewing
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

    const { count, rows: blogs } = await models.Blog.findAndCountAll({
      where: whereClause,
      order,
      limit,
      offset,
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription']
      }]
    });

    console.log(`Found ${count} blogs`);

    res.status(200).json({
      status: 'success',
      data: {
        blogs,
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
    console.log(`Getting blog with ID: ${req.params.id}`);

    const blog = await models.Blog.findByPk(req.params.id, {
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'bloggerDescription', 'avatar']
      }]
    });

    if (!blog) {
      return next(new AppError('Blog post not found', 404));
    }

    // Increment view count
    await blog.increment('viewCount', { by: 1 });

    res.status(200).json({
      status: 'success',
      data: { blog }
    });
  } catch (error) {
    console.error('Error in getBlogById:', error);
    next(new AppError('Failed to fetch blog post', 500));
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    console.log('Creating new blog with data:', req.body);

    // Validate request data
    const errors = validateBlogData(req.body);
    if (errors.length > 0) {
      return next(new AppError(errors.join('. '), 400));
    }

    const { title, content, excerpt, tags, status = 'published' } = req.body;

    // Process tags
    const processedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim())
      : Array.isArray(tags) ? tags : [];

    // Create slug
    const slug = createSlug(title);

    // Sanitize content
    const sanitizedContent = sanitizeContent(content);

    const blog = await models.Blog.create({
      title,
      content: sanitizedContent,
      excerpt,
      tags: processedTags,
      authorId: req.user.id,
      status,
      slug,
      publishedAt: status === 'published' ? new Date() : null
    });

    const blogWithAuthor = await models.Blog.findByPk(blog.id, {
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'bloggerDescription', 'avatar']
      }]
    });

    res.status(201).json({
      status: 'success',
      data: { blog: blogWithAuthor }
    });
  } catch (error) {
    console.error('Error in createBlog:', error);
    next(new AppError('Failed to create blog post', 500));
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    console.log(`Updating blog ${req.params.id} with data:`, req.body);

    const blog = await models.Blog.findByPk(req.params.id);
    
    if (!blog) {
      return next(new AppError('Blog post not found', 404));
    }

    // Check authorization
    if (blog.authorId !== req.user.id && !req.user.isAdmin) {
      return next(new AppError('Not authorized to update this blog', 403));
    }

    const { title, content, excerpt, tags, status } = req.body;

    // Process tags
    const processedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim())
      : Array.isArray(tags) ? tags : blog.tags;

    // Update data
    const updateData = {
      title: title || blog.title,
      content: content ? sanitizeContent(content) : blog.content,
      excerpt: excerpt || blog.excerpt,
      tags: processedTags,
      status: status || blog.status,
      slug: title ? createSlug(title) : blog.slug
    };

    // If status changes to published, update publishedAt
    if (status === 'published' && blog.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updatedBlog = await blog.update(updateData);

    const blogWithAuthor = await models.Blog.findByPk(updatedBlog.id, {
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'bloggerDescription', 'avatar']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: { blog: blogWithAuthor }
    });
  } catch (error) {
    console.error('Error in updateBlog:', error);
    next(new AppError('Failed to update blog post', 500));
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    console.log(`Deleting blog with ID: ${req.params.id}`);

    const blog = await models.Blog.findByPk(req.params.id);
    
    if (!blog) {
      return next(new AppError('Blog post not found', 404));
    }

    // Check authorization
    if (blog.authorId !== req.user.id && !req.user.isAdmin) {
      return next(new AppError('Not authorized to delete this blog', 403));
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

exports.getUserBlogs = async (req, res, next) => {
  try {
    console.log(`Getting blogs for user: ${req.params.userId || req.user.id}`);

    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: blogs } = await models.Blog.findAndCountAll({
      where: { authorId: userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'bloggerDescription', 'avatar']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalBlogs: count,
          blogsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error in getUserBlogs:', error);
    next(new AppError('Failed to fetch user blogs', 500));
  }
};

exports.getBlogsByTag = async (req, res, next) => {
  try {
    console.log(`Getting blogs with tag: ${req.params.tag}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const tag = req.params.tag;

    const { count, rows: blogs } = await models.Blog.findAndCountAll({
      where: {
        tags: { [Op.contains]: [tag] },
        status: 'published'
      },
      order: [['publishedAt', 'DESC']],
      limit,
      offset,
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'bloggerDescription', 'avatar']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalBlogs: count,
          blogsPerPage: limit
        },
        tag
      }
    });
  } catch (error) {
    console.error('Error in getBlogsByTag:', error);
    next(new AppError('Failed to fetch blogs by tag', 500));
  }
};

exports.getPopularTags = async (req, res, next) => {
  try {
    console.log('Getting popular tags');

    const blogs = await models.Blog.findAll({
      where: { status: 'published' },
      attributes: ['tags']
    });

    // Count tag occurrences
    const tagCount = {};
    blogs.forEach(blog => {
      blog.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // Convert to array and sort
    const popularTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: { tags: popularTags }
    });
  } catch (error) {
    console.error('Error in getPopularTags:', error);
    next(new AppError('Failed to fetch popular tags', 500));
  }
};

// Stats and Analytics
exports.getBlogStats = async (req, res, next) => {
  try {
    console.log('Getting blog statistics');

    const totalBlogs = await models.Blog.count();
    const publishedBlogs = await models.Blog.count({ where: { status: 'published' } });
    const draftBlogs = await models.Blog.count({ where: { status: 'draft' } });
    const totalViews = await models.Blog.sum('viewCount');
    
    const topBlogs = await models.Blog.findAll({
      where: { status: 'published' },
      order: [['viewCount', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'viewCount', 'publishedAt'],
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalViews,
          averageViewsPerBlog: totalBlogs > 0 ? Math.round(totalViews / totalBlogs) : 0
        },
        topBlogs
      }
    });
  } catch (error) {
    console.error('Error in getBlogStats:', error);
    next(new AppError('Failed to fetch blog statistics', 500));
  }
};

exports.getAuthorStats = async (req, res, next) => {
  try {
    console.log(`Getting author statistics for user: ${req.user.id}`);

    const authorStats = await models.Blog.findAndCountAll({
      where: { authorId: req.user.id },
      attributes: [
        'status',
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count'],
        [models.sequelize.fn('SUM', models.sequelize.col('viewCount')), 'totalViews']
      ],
      group: ['status']
    });

    const topAuthorBlogs = await models.Blog.findAll({
      where: { 
        authorId: req.user.id,
        status: 'published'
      },
      order: [['viewCount', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'viewCount', 'publishedAt']
    });

    const monthlyViews = await models.Blog.findAll({
      where: { 
        authorId: req.user.id,
        status: 'published'
      },
      attributes: [
        [models.sequelize.fn('date_trunc', 'month', models.sequelize.col('publishedAt')), 'month'],
        [models.sequelize.fn('SUM', models.sequelize.col('viewCount')), 'views']
      ],
      group: [models.sequelize.fn('date_trunc', 'month', models.sequelize.col('publishedAt'))],
      order: [[models.sequelize.fn('date_trunc', 'month', models.sequelize.col('publishedAt')), 'DESC']],
      limit: 12
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: authorStats,
        topBlogs: topAuthorBlogs,
        monthlyViews
      }
    });
  } catch (error) {
    console.error('Error in getAuthorStats:', error);
    next(new AppError('Failed to fetch author statistics', 500));
  }
};

// Search and Discovery
exports.searchBlogs = async (req, res, next) => {
  try {
    console.log('Searching blogs with query:', req.query);

    const {
      query = '',
      page = 1,
      limit = 10,
      sortBy = 'relevance',
      status = 'published',
      tags = []
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search conditions
    const whereClause = {
      status,
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { content: { [Op.iLike]: `%${query}%` } },
        { excerpt: { [Op.iLike]: `%${query}%` } }
      ]
    };

    // Add tag filtering if provided
    if (tags.length > 0) {
      whereClause.tags = { [Op.overlap]: Array.isArray(tags) ? tags : [tags] };
    }

    // Determine sort order
    let order;
    switch (sortBy) {
      case 'relevance':
        // For relevance sorting, we might want to use full-text search capabilities
        // This is a simplified version
        order = [[models.sequelize.literal(`
          CASE 
            WHEN title ILIKE '%${query}%' THEN 1
            WHEN excerpt ILIKE '%${query}%' THEN 2
            ELSE 3
          END
        `), 'ASC'], ['publishedAt', 'DESC']];
        break;
      case 'latest':
        order = [['publishedAt', 'DESC']];
        break;
      case 'popular':
        order = [['viewCount', 'DESC']];
        break;
      default:
        order = [['publishedAt', 'DESC']];
    }

    const { count, rows: blogs } = await models.Blog.findAndCountAll({
      where: whereClause,
      order,
      limit: parseInt(limit),
      offset,
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'bloggerDescription', 'avatar']
      }],
      distinct: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalResults: count,
          resultsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in searchBlogs:', error);
    next(new AppError('Failed to search blogs', 500));
  }
};

// Featured and Related Content
exports.getFeaturedBlogs = async (req, res, next) => {
  try {
    console.log('Getting featured blogs');

    const featuredBlogs = await models.Blog.findAll({
      where: { 
        status: 'published',
        viewCount: {
          [Op.gte]: 100 // Minimum views to be considered featured
        }
      },
      order: [
        ['viewCount', 'DESC'],
        ['publishedAt', 'DESC']
      ],
      limit: 5,
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription', 'avatar']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: { featuredBlogs }
    });
  } catch (error) {
    console.error('Error in getFeaturedBlogs:', error);
    next(new AppError('Failed to fetch featured blogs', 500));
  }
};

exports.getRelatedBlogs = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    console.log(`Getting related blogs for blog: ${blogId}`);

    const sourceBlog = await models.Blog.findByPk(blogId);
    if (!sourceBlog) {
      return next(new AppError('Blog not found', 404));
    }

    const relatedBlogs = await models.Blog.findAll({
      where: {
        id: { [Op.ne]: blogId },
        status: 'published', // Only return published blogs
        tags: { [Op.overlap]: sourceBlog.tags }
      },
      order: [['publishedAt', 'DESC']],
      limit: 3,
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'bloggerDescription', 'avatar']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: { relatedBlogs }
    });
  } catch (error) {
    console.error('Error in getRelatedBlogs:', error);
    next(new AppError('Failed to fetch related blogs', 500));
  }
};

// Comment functionality (if needed)
// Note: This would require a Comment model to be set up
exports.addComment = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const blog = await models.Blog.findByPk(blogId);
    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    const comment = await models.Comment.create({
      content,
      blogId,
      userId
    });

    const commentWithUser = await models.Comment.findByPk(comment.id, {
      include: [{
        model: models.User,
        attributes: ['id', 'name', 'avatar']
      }]
    });

    res.status(201).json({
      status: 'success',
      data: { comment: commentWithUser }
    });
  } catch (error) {
    console.error('Error in addComment:', error);
    next(new AppError('Failed to add comment', 500));
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: comments } = await models.Comment.findAndCountAll({
      where: { blogId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [{
        model: models.User,
        attributes: ['id', 'name', 'avatar']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalComments: count,
          commentsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error in getComments:', error);
    next(new AppError('Failed to fetch comments', 500));
  }
};

module.exports = exports;