const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTaxes,
  addTax,
  updateTax,
  deleteTax,
  importTaxes
} = require('../controllers/taxController');

router.route('/')
  .get(protect, getTaxes)
  .post(protect, addTax);

router.route('/:id')
  .put(protect, updateTax)
  .delete(protect, deleteTax);

router.post('/import', protect, importTaxes);

module.exports = router;