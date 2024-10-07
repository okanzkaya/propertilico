const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Message cannot be empty' }
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Rating must be at least 0' },
      max: { args: [5], msg: 'Rating must be at most 5' }
    }
  },
  feedbackType: {
    type: DataTypes.ENUM('bug', 'feature', 'improvement', 'general'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['bug', 'feature', 'improvement', 'general']],
        msg: 'Invalid feedback type'
      }
    }
  },
  attachment: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  indexes: [
    { fields: ['feedbackType'] },
    { fields: ['createdAt'] },
    { fields: ['userId'] }
  ]
});

module.exports = Feedback;