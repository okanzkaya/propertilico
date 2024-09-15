const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');

router.use(protect);

// Check if each function exists before using it
const { createProperty, getUserProperties, getPropertyById, updateProperty, deleteProperty } = propertyController;

if (typeof getUserProperties === 'function') {
  router.get('/', getUserProperties);
} else {
  console.error('getUserProperties is not a function');
}

if (typeof createProperty === 'function') {
  router.post('/', createProperty);
} else {
  console.error('createProperty is not a function');
}

if (typeof getPropertyById === 'function') {
  router.get('/:id', getPropertyById);
} else {
  console.error('getPropertyById is not a function');
}

if (typeof updateProperty === 'function') {
  router.put('/:id', updateProperty);
} else {
  console.error('updateProperty is not a function');
}

if (typeof deleteProperty === 'function') {
  router.delete('/:id', deleteProperty);
} else {
  console.error('deleteProperty is not a function');
}

module.exports = router;