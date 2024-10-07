const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Title cannot be empty' },
      len: { args: [1, 255], msg: 'Title must be between 1 and 255 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description cannot be empty' }
    }
  },
  type: {
    type: DataTypes.ENUM('PropertyOverview', 'TicketSummary', 'FinancialOverview', 'OccupancyTrend'),
    allowNull: false
  },
  chartType: {
    type: DataTypes.ENUM('bar', 'line', 'pie'),
    allowNull: false
  },
  dataFetchFunction: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Data fetch function cannot be empty' }
    }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? rawValue : [];
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    { fields: ['type'] },
    { fields: ['chartType'] },
    { fields: ['tags'], using: 'gin' },
    { fields: ['isActive'] }
  ],
  scopes: {
    active: {
      where: { isActive: true }
    }
  }
});

// Instance method to update tags
Report.prototype.updateTags = async function(newTags) {
  this.tags = [...new Set([...this.tags, ...newTags])];
  return this.save();
};

// Class method to find reports by tag
Report.findByTag = function(tag) {
  return this.findAll({
    where: {
      tags: {
        [sequelize.Op.contains]: [tag]
      }
    }
  });
};

module.exports = Report;