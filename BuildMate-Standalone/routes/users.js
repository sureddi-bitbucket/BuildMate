const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all distributors
router.get('/distributors', authenticateToken, (req, res) => {
  db.all(`
    SELECT id, name, email, phone, address, created_at
    FROM users
    WHERE role = 'distributor'
    ORDER BY name
  `, (err, distributors) => {
    if (err) {
      console.error('Error fetching distributors:', err);
      return res.status(500).json({ error: 'Failed to fetch distributors' });
    }
    res.json(distributors);
  });
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  db.get(`
    SELECT id, email, name, role, phone, address, created_at
    FROM users
    WHERE id = ?
  `, [req.user.id], (err, user) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const { name, phone, address } = req.body;

  db.run(`
    UPDATE users
    SET name = ?, phone = ?, address = ?
    WHERE id = ?
  `, [name, phone || null, address || null, req.user.id], function(err) {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  });
});

module.exports = router;

