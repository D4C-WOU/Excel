const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;