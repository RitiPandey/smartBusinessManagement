const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const protect = require('../middleware/protect');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ─── POST /api/auth/register ───────────────────────────────
router.post('/register', async (req, res) => {
  console.log('--- REGISTER HIT ---');
  const { name, email, password, shopName } = req.body;

  if (!name || !email || !password || !shopName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if email already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password here directly — no pre-save hook needed
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      shopName,
    });

    console.log('User created successfully:', user._id);

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
      },
    });
  } catch (err) {
    console.log('REGISTER ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  console.log('--- LOGIN HIT ---');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password directly here
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful:', user._id);

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
      },
    });
  } catch (err) {
    console.log('LOGIN ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET /api/auth/verify ─────────────────────────────────
// This endpoint checks if the user's token is still valid
// Frontend calls this when app starts to verify if user is still logged in
router.get('/verify', protect, async (req, res) => {
  try {
    // req.user.id comes from the protect middleware after JWT verification
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Token is valid and user exists - send back user data
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
      },
    });
  } catch (err) {
    console.log('VERIFY ERROR:', err.message);
    res.status(401).json({ message: 'Token verification failed' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────
// This endpoint handles user logout
// Frontend calls this when user clicks logout button
router.post('/logout', protect, (req, res) => {
  try {
    // In JWT, logout is handled on frontend by removing token from localStorage
    // This endpoint can be used for server-side cleanup if needed in future
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;