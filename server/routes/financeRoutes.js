const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary
} = require('../controllers/financeController');

router.use(protect);

router.route('/transactions')
  .get(getTransactions)
  .post(addTransaction);

router.route('/transactions/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

router.get('/summary', getFinancialSummary);

module.exports = router;