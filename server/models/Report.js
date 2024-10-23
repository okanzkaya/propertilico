const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
      type: DataTypes.ENUM('PropertyOverview', 'TicketSummary', 'FinancialOverview', 'OccupancyTrend', 'Custom'),
      allowNull: false
    },
    chartType: {
      type: DataTypes.ENUM('bar', 'line', 'pie', 'doughnut', 'radar'),
      allowNull: false
    },
    dataFetchFunction: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Data fetch function cannot be empty' },
        isIn: {
          args: [['getPropertyStats', 'getTicketStats', 'getFinancialStats', 'getOccupancyStats']],
          msg: 'Invalid data fetch function'
        }
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? rawValue : [];
      },
      set(val) {
        this.setDataValue('tags', val.map(tag => tag.toLowerCase()));
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    lastGeneratedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'reports',
    underscored: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['chart_type'] },
      { fields: ['tags'], using: 'gin' },
      { fields: ['is_active'] },
      { fields: ['user_id'] }
    ],
    scopes: {
      active: {
        where: { isActive: true }
      }
    }
  });

  Report.prototype.updateTags = async function(newTags) {
    this.tags = [...new Set([...this.tags, ...newTags.map(tag => tag.toLowerCase())])];
    return this.save();
  };

  Report.prototype.setLastGeneratedAt = async function() {
    this.lastGeneratedAt = new Date();
    return this.save();
  };

  Report.findByTag = function(tag) {
    return this.findAll({
      where: {
        tags: {
          [sequelize.Sequelize.Op.contains]: [tag.toLowerCase()]
        }
      }
    });
  };

  Report.associate = (models) => {
    Report.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Report;
};