const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReports, getReportData } = require('../controllers/reportController');
const { getPropertyStats, getTicketStats, getFinancialStats, getOccupancyStats } = require('../controllers/statsController');

router.use(protect);

// Report routes
router.get('/', getReports);
router.get('/:id', getReportData);

// Stats routes
router.get('/properties/stats', getPropertyStats);
router.get('/tickets/stats', getTicketStats);
router.get('/finances/stats', getFinancialStats);
router.get('/properties/occupancy', getOccupancyStats);

module.exports = router;