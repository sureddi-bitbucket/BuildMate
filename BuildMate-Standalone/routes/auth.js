const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { email, password, name, role, phone, address } = req.body;

  // Validate input
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Registration failed' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    db.run(
      `INSERT INTO users (email, password, name, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, role, phone || null, address || null],
      function(err) {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Registration failed' });
        }

        res.status(201).json({ 
          message: 'User registered successfully', 
          userId: this.lastID 
        });
      }
    );
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.password;

    res.json({ token, user });
  });
});

module.exports = router;

