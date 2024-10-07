const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  type: {
    type: DataTypes.ENUM('file', 'folder'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('document', 'image', 'video', 'other'),
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  size: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  content: {
    type: DataTypes.BLOB,
    allowNull: true
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Documents',
      key: 'id'
    }
  }
}, {
  indexes: [
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['path'] },
    { fields: ['parentId'] }
  ]
});

// Define associations
Document.associate = (models) => {
  Document.belongsTo(models.User, { 
    foreignKey: { 
      name: 'userId', 
      allowNull: false 
    }
  });
  Document.belongsTo(Document, { as: 'parent', foreignKey: 'parentId' });
  Document.hasMany(Document, { as: 'children', foreignKey: 'parentId' });
};

module.exports = Document;