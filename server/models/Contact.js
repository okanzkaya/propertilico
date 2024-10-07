const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
      notEmpty: true,
      len: [1, 100]
    }
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 20]
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
  }
}, {
  indexes: [
    { fields: ['email'] },
    { fields: ['phone'] }
  ]
});

// Define associations
Contact.associate = (models) => {
  Contact.belongsTo(models.User, { 
    foreignKey: { 
      name: 'userId', 
      allowNull: false 
    }
  });
};

module.exports = Contact;