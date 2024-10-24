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
        len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' }
      }
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
        len: { args: [10, 500], msg: 'Excerpt must be between 10 and 500 characters' }
      }
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
    }
  }, {
    tableName: 'blogs',
    underscored: true,
    indexes: [
      { fields: ['author_id'] },
      { fields: ['status'] },
      { fields: ['published_at'] }
    ]
  });

  Blog.associate = (models) => {
    Blog.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author',
      onDelete: 'CASCADE'
    });
  };

  return Blog;
};