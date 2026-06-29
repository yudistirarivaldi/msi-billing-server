const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Login endpoint
router.post('/login', AuthController.login);

// Logout endpoint
router.post('/logout', AuthController.logout);

// Get current user info (requires authentication)
router.get('/me', authMiddleware, AuthController.getMe);

module.exports = router;

