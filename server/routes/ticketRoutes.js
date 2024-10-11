const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ticketController = require('../controllers/ticketController');

router.use(protect);

router.route('/')
  .get(ticketController.getTickets)
  .post(ticketController.createTicket);

router.route('/:id')
  .get(ticketController.getTicketById)
  .put(ticketController.updateTicket)
  .delete(ticketController.deleteTicket);

router.post('/:id/notes', ticketController.addNote);

module.exports = router;