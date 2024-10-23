const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
  getReports, 
  getReportData, 
  createCustomReport, 
  updateReport, 
  deleteReport 
} = require('../controllers/reportController');
const { 
  getPropertyStats, 
  getTicketStats, 
  getFinancialStats, 
  getOccupancyStats, 
  getAllStats
} = require('../controllers/statsController');

// Apply protection middleware to all routes
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
router.get('/all-stats', getAllStats);
router.get('/properties/stats', getPropertyStats);
router.get('/tickets/stats', getTicketStats);
router.get('/finances/stats', getFinancialStats);
router.get('/properties/occupancy', getOccupancyStats);

// Admin-only routes
router.use(admin);
router.post('/initialize', async (req, res, next) => {
  try {
    await require('../controllers/reportController').initializeReports();
    res.status(200).json({ message: 'Reports initialized successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;