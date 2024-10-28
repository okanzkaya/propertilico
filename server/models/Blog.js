const { DataTypes, Op } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const Blog = sequelize.define('Blog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title cannot be empty' },
        len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' }
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Content cannot be empty' },
        len: { args: [100, 50000], msg: 'Content must be between 100 and 50000 characters' }
      }
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Excerpt cannot be empty' },
        len: { args: [10, 500], msg: 'Excerpt must be between 10 and 500 characters' }
      }
    },
    imageUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: 'image_url'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isValidTagArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
          if (value.some(tag => typeof tag !== 'string')) {
            throw new Error('All tags must be strings');
          }
        }
      }
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'author_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    publishedAt: {
      type: DataTypes.DATE,
      field: 'published_at',
      defaultValue: DataTypes.NOW
    },
    readTime: {
      type: DataTypes.INTEGER,
      field: 'read_time',
      defaultValue: 0
    },
    isFeaturePost: {
      type: DataTypes.BOOLEAN,
      field: 'is_featured',
      defaultValue: false
    }
  }, {
    tableName: 'blogs',
    underscored: true,
    indexes: [
      { fields: ['author_id'] },
      { fields: ['status'] },
      { fields: ['published_at'] },
      { fields: ['slug'], unique: true }
    ],
    hooks: {
      beforeValidate: async (blog) => {
        if (!blog.title) return;

        try {
          // Generate base slug
          const baseSlug = slugify(blog.title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
          });

          // Check for existing slugs
          let slug = baseSlug;
          let counter = 1;
          const whereClause = { slug };
          
          if (blog.id) {
            whereClause.id = { [Op.ne]: blog.id };
          }

          let existingBlog = await sequelize.models.Blog.findOne({
            where: whereClause
          });

          while (existingBlog) {
            slug = `${baseSlug}-${counter}`;
            whereClause.slug = slug;
            existingBlog = await sequelize.models.Blog.findOne({
              where: whereClause
            });
            counter++;
          }

          blog.slug = slug;

          // Calculate read time
          if (blog.content) {
            const wordsPerMinute = 200;
            const wordCount = blog.content.trim().split(/\s+/).length;
            blog.readTime = Math.ceil(wordCount / wordsPerMinute);
          }

          // Format tags
          if (blog.tags && Array.isArray(blog.tags)) {
            blog.tags = blog.tags
              .map(tag => tag.trim().toLowerCase())
              .filter(Boolean)
              .filter((tag, index, self) => self.indexOf(tag) === index);
          }

          // Set publishedAt for new published posts
          if (blog.status === 'published' && !blog.publishedAt) {
            blog.publishedAt = new Date();
          }

          // Ensure imageUrl starts with /
          if (blog.imageUrl && !blog.imageUrl.startsWith('/')) {
            blog.imageUrl = `/${blog.imageUrl}`;
          }

        } catch (error) {
          console.error('Error in Blog beforeValidate hook:', error);
          throw error;
        }
      }
    }
  });

  Blog.associate = (models) => {
    Blog.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author',
      onDelete: 'CASCADE'
    });
  };

  // Instance Methods
  Blog.prototype.incrementViewCount = async function() {
    this.viewCount += 1;
    return this.save();
  };

  Blog.prototype.toggleFeatured = async function() {
    this.isFeaturePost = !this.isFeaturePost;
    return this.save();
  };

  return Blog;
};