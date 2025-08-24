const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Create new user
router.post('/', (req, res) => {
  try {
    const { username, email } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const user = User.create({ username, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user (mock authentication)
router.post('/login', (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/', (req, res) => {
  try {
    const users = User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;