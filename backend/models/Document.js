module.exports = (sequelize, DataTypes) => {
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
        notEmpty: { msg: 'Name cannot be empty' },
        len: { args: [1, 255], msg: 'Name must be between 1 and 255 characters' }
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
        min: { args: [0], msg: 'Size cannot be negative' }
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
        notEmpty: { msg: 'Path cannot be empty' }
      }
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'documents',
    underscored: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['path'] },
      { fields: ['parent_id'] },
      { fields: ['user_id'] }
    ]
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    Document.belongsTo(Document, { 
      as: 'parent', 
      foreignKey: 'parent_id'
    });
    Document.hasMany(Document, { 
      as: 'children', 
      foreignKey: 'parent_id'
    });
  };

  return Document;
};