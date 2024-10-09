module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        isIn: { args: [['income', 'expense']], msg: 'Invalid transaction type' }
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
        isBefore: { args: [new Date().toISOString().split('T')[0]], msg: 'Date cannot be in the future' }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    indexes: [
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['date'] },
      { fields: ['userId'] },
      { fields: ['propertyId'] }
    ],
    hooks: {
      beforeValidate: (transaction) => {
        if (transaction.date && !(transaction.date instanceof Date)) {
          transaction.date = new Date(transaction.date);
        }
      }
    }
  });

  Transaction.getTotalAmount = async function(userId, type, startDate, endDate) {
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

  return Transaction;
};