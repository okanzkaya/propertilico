const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');

router.use(protect);

// Add the favorites route
router.post('/favorites/:id', propertyController.toggleFavorite);

router.route('/')
  .get(propertyController.getUserProperties)
  .post(propertyController.createProperty);

router.route('/:id')
  .get(propertyController.getPropertyById)
  .put(propertyController.updateProperty)
  .delete(propertyController.deleteProperty);

module.exports = router;