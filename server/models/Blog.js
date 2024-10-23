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
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'author_id'
    }
  }, {
    tableName: 'blogs',
    underscored: true
  });

  Blog.associate = (models) => {
    Blog.belongsTo(models.User, { 
      foreignKey: 'author_id', 
      as: 'author'
    });
  };

  return Blog;
};