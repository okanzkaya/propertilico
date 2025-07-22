const { models, sequelize } = require('../config/db');
const { validateTransaction } = require('../utils/validation');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await models.Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

exports.addTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { error } = validateTransaction(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const newTransaction = await models.Transaction.create({
      ...req.body,
      userId: req.user.id
    }, { transaction: t });

    await t.commit();
    res.status(201).json(newTransaction);
  } catch (error) {
    await t.rollback();
    console.error('Error adding transaction:', error);

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors
      });
    }

    res.status(500).json({ 
      message: 'Error adding transaction', 
      error: error.message
    });
  }
};

exports.updateTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { type, category, amount, description, date } = req.body;
    const { error } = validateTransaction({ type, category, amount, description, date });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const [updatedRowsCount, updatedTransactions] = await models.Transaction.update(
      { type, category, amount, description, date },
      {
        where: { id: req.params.id, userId: req.user.id },
        returning: true,
        transaction: t
      }
    );

    if (updatedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await t.commit();
    res.json(updatedTransactions[0]);
  } catch (error) {
    await t.rollback();
    console.error('Error updating transaction:', error);
    res.status(400).json({ 
      message: 'Error updating transaction', 
      error: error.errors ? error.errors[0].message : error.message 
    });
  }
};

exports.deleteTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    console.log('Deleting transaction with ID:', req.params.id);
    console.log('User ID:', req.user.id);

    const deletedRowsCount = await models.Transaction.destroy({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });

    console.log('Deleted rows count:', deletedRowsCount);

    if (deletedRowsCount === 0) {
      await t.rollback();
      console.log('Transaction not found or not authorized');
      return res.status(404).json({ message: 'Transaction not found or not authorized to delete' });
    }

    await t.commit();
    console.log('Transaction deleted successfully');
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

exports.getFinancialSummary = async (req, res) => {
  try {
    const results = await models.Transaction.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'income\' THEN amount ELSE 0 END')), 'totalIncome'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'expense\' THEN amount ELSE 0 END')), 'totalExpense'],
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'month'],
        [sequelize.fn('DATE_TRUNC', 'year', sequelize.col('date')), 'year'],
        [sequelize.literal('SUM(CASE WHEN type = \'income\' THEN amount ELSE -amount END)'), 'netProfit'],
        'type',
        'category'
      ],
      where: { userId: req.user.id },
      group: [
        sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')),
        sequelize.fn('DATE_TRUNC', 'year', sequelize.col('date')),
        'type',
        'category'
      ],
      order: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'ASC'],
        [sequelize.fn('DATE_TRUNC', 'year', sequelize.col('date')), 'ASC']
      ],
      raw: true
    });

    const monthlyData = results.reduce((acc, result) => {
      const month = new Date(result.month).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { name: month, income: 0, expense: 0, netProfit: 0 };
      }
      acc[month].income += parseFloat(result.totalIncome) || 0;
      acc[month].expense += parseFloat(result.totalExpense) || 0;
      acc[month].netProfit += parseFloat(result.netProfit) || 0;
      return acc;
    }, {});

    const yearlyData = results.reduce((acc, result) => {
      const year = new Date(result.year).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = { name: year, netProfit: 0 };
      }
      acc[year].netProfit += parseFloat(result.netProfit) || 0;
      return acc;
    }, {});

    const incomeBreakdown = results
      .filter(result => result.type === 'income')
      .reduce((acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = 0;
        }
        acc[result.category] += parseFloat(result.totalIncome) || 0;
        return acc;
      }, {});

    const expenseBreakdown = results
      .filter(result => result.type === 'expense')
      .reduce((acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = 0;
        }
        acc[result.category] += parseFloat(result.totalExpense) || 0;
        return acc;
      }, {});

    const summary = {
      totalIncome: results.reduce((sum, result) => sum + parseFloat(result.totalIncome || 0), 0),
      totalExpense: results.reduce((sum, result) => sum + parseFloat(result.totalExpense || 0), 0),
      balance: results.reduce((sum, result) => sum + parseFloat(result.netProfit || 0), 0),
      monthlyData: Object.values(monthlyData),
      yearlyData: Object.values(yearlyData),
      incomeBreakdown: Object.entries(incomeBreakdown).map(([name, value]) => ({ name, value })),
      expenseBreakdown: Object.entries(expenseBreakdown).map(([name, value]) => ({ name, value }))
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ message: 'Error fetching financial summary', error: error.message });
  }
};