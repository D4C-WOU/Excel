const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User profile routes
router.get('/profile', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.put('/profile', protect, async (req, res) => {
  // Update user profile logic here
  res.json({
    success: true,
    message: 'Profile updated'
  });
});

// Admin routes
router.get('/all', protect, adminOnly, async (req, res) => {
  // Get all users (admin only)
  const User = require('../models/User');
  const users = await User.find().select('-password');
  res.json({
    success: true,
    users
  });
});

module.exports = router;