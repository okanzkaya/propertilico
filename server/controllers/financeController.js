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
    res.status(500).json({ message: 'Error adding transaction', error: error.message });
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
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const deletedRowsCount = await models.Transaction.destroy({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });

    if (deletedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await t.commit();
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
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'expense\' THEN amount ELSE 0 END')), 'totalExpense']
      ],
      where: { userId: req.user.id }
    });

    const summary = {
      totalIncome: parseFloat(results[0].get('totalIncome')) || 0,
      totalExpense: parseFloat(results[0].get('totalExpense')) || 0,
      balance: (parseFloat(results[0].get('totalIncome')) || 0) - (parseFloat(results[0].get('totalExpense')) || 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ message: 'Error fetching financial summary', error: error.message });
  }
};