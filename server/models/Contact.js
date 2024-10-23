module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' },
        len: { args: [1, 100], msg: 'Name must be between 1 and 100 characters' }
      }
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Role cannot be empty' },
        len: { args: [1, 50], msg: 'Role must be between 1 and 50 characters' }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: { msg: 'Please enter a valid email address' },
        notEmpty: { msg: 'Email cannot be empty' }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number cannot be empty' },
        len: { args: [1, 20], msg: 'Phone number must be between 1 and 20 characters' }
      }
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customFields: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'contacts',
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['phone'] },
      { fields: ['user_id'] }
    ]
  });

  Contact.associate = (models) => {
    Contact.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Contact;
};