const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');

console.log('Contact routes loaded');

router.use(protect);

router.route('/')
  .get(contactController.getContacts)
  .post(contactController.createContact);

router.route('/search')
  .get(contactController.searchContacts);

router.route('/:id')
  .get(contactController.getContactById)
  .put(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;