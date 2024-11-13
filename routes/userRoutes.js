// backend/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}); // Await the result of the query
    console.log("users data: ", users);
    res.json({users}); // Return the users as a plain JSON object
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateJWT, (req, res) => {
  res.json(req.user);
});


module.exports = router;
