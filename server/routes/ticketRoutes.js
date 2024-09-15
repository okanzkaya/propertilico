const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ticketController = require('../controllers/ticketController');

router.use(protect);

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);
router.post('/:id/notes', ticketController.addNote);

module.exports = router;