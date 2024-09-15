// server/routes/contactRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(contactController.getContacts)
  .post(upload.single('avatar'), contactController.createContact);

router.route('/:id')
  .put(upload.single('avatar'), contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;