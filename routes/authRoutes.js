// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../config/jwt');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { fullName, email, password, role, studentId } = req.body;
  console.log("req.body: ",req.body);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ fullName, email, password, role, studentId });
    await user.save();

    res.status(201).json({ token: generateToken(user),message: 'User created successfully' });
  } catch (error) {
    console.log("error:",error)
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("user: ",user);
    console.log("user.id: ",user._id.toString());
    const token = generateToken(user);
    console.log("token: ",token);

    // res.status(200).json({ token:token, role:user.role,UserId:user._id.toString() });
    res.status(200).json({ token:token, user: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const generateToken = require('../utils/generateToken');

// // Register
// router.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const user = new User({ name, email, password });
//     await user.save();
//     res.status(201).json({ token: generateToken(user) });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     res.json({ token: generateToken(user) });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;