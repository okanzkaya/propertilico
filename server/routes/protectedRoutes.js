// src/routes/protectedRoutes.js
const express = require('express');
const router = express.Router();

router.get('/check-subscription', (req, res) => {
  res.json({ isActive: true });
});

module.exports = router;
