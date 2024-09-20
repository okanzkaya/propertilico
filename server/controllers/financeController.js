// server/controllers/financeController.js

const Transaction = require('../models/Transaction');
const { validateTransaction } = require('../utils/validation');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort('-date');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { error } = validateTransaction(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const newTransaction = new Transaction({
      ...req.body,
      user: req.user.id
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction', error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;
    const { error } = validateTransaction({ type, category, amount, description, date });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { type, category, amount, description, date },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

exports.getFinancialSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    
    // Calculate summary data here
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      // Add more summary data as needed
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
      } else {
        summary.totalExpense += transaction.amount;
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial summary', error: error.message });
  }
};