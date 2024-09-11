const express = require('express');
const { registerUser, authUser, refreshAccessToken } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/refresh-token', refreshAccessToken);

module.exports = router;