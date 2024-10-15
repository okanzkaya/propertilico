const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Transaction.belongsTo(models.Property, {
        foreignKey: 'propertyId',
        as: 'property'
      });
    }

    static getTotalAmount = async function(userId, type, startDate, endDate) {
      const result = await this.findOne({
        where: {
          userId,
          type,
          date: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        raw: true
      });

      return result.total || 0;
    };
  }

  Transaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['income', 'expense']],
          msg: 'Transaction type must be either income or expense'
        }
      }
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Category cannot be empty' },
        len: { args: [1, 100], msg: 'Category must be between 1 and 100 characters' }
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Amount must be a valid decimal number' },
        min: { args: [0.01], msg: 'Amount must be greater than 0' }
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description cannot be empty' },
        len: { args: [1, 255], msg: 'Description must be between 1 and 255 characters' }
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Invalid date format' },
        isNotFuture(value) {
          if (new Date(value) > new Date()) {
            throw new Error('Date cannot be in the future');
          }
        }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: true
    },
    nextOccurrence: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    underscored: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['date'] },
      { fields: ['user_id'] },
      { fields: ['property_id'] },
      { fields: ['recurring'] },
      { fields: ['frequency'] }
    ],
    hooks: {
      beforeValidate: (transaction) => {
        if (transaction.date && !(transaction.date instanceof Date)) {
          transaction.date = new Date(transaction.date);
        }
      },
      afterCreate: async (transaction, options) => {
        if (transaction.recurring) {
          // Logic to schedule next occurrence
          // This is a placeholder and should be implemented based on your scheduling strategy
          console.log('Scheduling next occurrence for recurring transaction:', transaction.id);
        }
      }
    }
  });

  return Transaction;
};