const { DataTypes } = require('sequelize');

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
        len: { args: [1, 255], msg: 'Title must be between 1 and 255 characters' }
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Content cannot be empty' }
      }
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Excerpt cannot be empty' },
        len: { args: [1, 500], msg: 'Excerpt must be between 1 and 500 characters' }
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue('tags', val.map(tag => tag.toLowerCase().trim()));
        } else if (typeof val === 'string') {
          this.setDataValue('tags', [val.toLowerCase().trim()]);
        } else {
          this.setDataValue('tags', []);
        }
      }
    },
    publishedAt: {
      type: DataTypes.DATE
    },
    lastModified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    featuredImage: {
      type: DataTypes.STRING
    },
    metaTitle: {
      type: DataTypes.STRING(100)
    },
    metaDescription: {
      type: DataTypes.STRING(160)
    },
    readTime: {
      type: DataTypes.INTEGER,
      comment: 'Estimated read time in minutes'
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    indexes: [
      { fields: ['publishedAt'] },
      { fields: ['authorId'] },
      { fields: ['status'] },
      { fields: ['tags'] }
    ],
    hooks: {
      beforeValidate: (blog) => {
        if (blog.title) {
          blog.slug = blog.title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
        }
      },
      beforeSave: (blog) => {
        blog.lastModified = new Date();
        if (blog.status === 'published' && !blog.publishedAt) {
          blog.publishedAt = new Date();
        }
        if (blog.content) {
          const wordCount = blog.content.split(/\s+/).length;
          blog.readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute reading speed
        }
      }
    }
  });

  Blog.associate = (models) => {
    Blog.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
  };

  Blog.prototype.incrementViews = async function() {
    this.views += 1;
    return this.save();
  };

  Blog.prototype.incrementLikes = async function() {
    this.likes += 1;
    return this.save();
  };

  return Blog;
};