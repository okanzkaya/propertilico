const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReports, getReportData, createCustomReport, updateReport, deleteReport } = require('../controllers/reportController');
const { getPropertyStats, getTicketStats, getFinancialStats, getOccupancyStats } = require('../controllers/statsController');

router.use(protect);

// Report routes
router.route('/')
  .get(getReports)
  .post(createCustomReport);

router.route('/:id')
  .get(getReportData)
  .put(updateReport)
  .delete(deleteReport);

// Stats routes
router.get('/properties/stats', getPropertyStats);
router.get('/tickets/stats', getTicketStats);
router.get('/finances/stats', getFinancialStats);
router.get('/properties/occupancy', getOccupancyStats);

module.exports = router;