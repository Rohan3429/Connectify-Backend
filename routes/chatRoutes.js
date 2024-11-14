const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, async (req, res) => {
  const messages = await Message.find()
    .sort({ timestamp: -1 });
  res.json(messages);
});

module.exports = router;
