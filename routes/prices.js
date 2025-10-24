const express = require('express');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get latest prices for a distributor
router.get('/distributor/:distributorId', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      p.id,
      p.distributor_id,
      p.material_id,
      p.price,
      p.effective_date,
      m.name as material_name,
      m.category,
      m.manufacturer,
      m.grade,
      m.type,
      m.unit
    FROM prices p
    JOIN materials m ON p.material_id = m.id
    WHERE p.distributor_id = ?
      AND p.effective_date = (
        SELECT MAX(effective_date)
        FROM prices
        WHERE material_id = p.material_id AND distributor_id = p.distributor_id
      )
    ORDER BY m.category, m.name
  `, [req.params.distributorId], (err, prices) => {
    if (err) {
      console.error('Error fetching prices:', err);
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }
    res.json(prices);
  });
});

// Get current prices for logged-in distributor
router.get('/my-prices', authenticateToken, authorizeRole('distributor'), (req, res) => {
  db.all(`
    SELECT 
      p.id,
      p.material_id,
      p.price,
      p.effective_date,
      m.name as material_name,
      m.category,
      m.manufacturer,
      m.grade,
      m.type,
      m.unit,
      i.quantity
    FROM prices p
    JOIN materials m ON p.material_id = m.id
    LEFT JOIN inventory i ON i.material_id = p.material_id AND i.distributor_id = p.distributor_id
    WHERE p.distributor_id = ?
      AND p.effective_date = (
        SELECT MAX(effective_date)
        FROM prices
        WHERE material_id = p.material_id AND distributor_id = p.distributor_id
      )
    ORDER BY m.category, m.name
  `, [req.user.id], (err, prices) => {
    if (err) {
      console.error('Error fetching prices:', err);
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }
    res.json(prices);
  });
});

// Get all latest prices (for consumers to compare)
router.get('/all', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      p.id,
      p.distributor_id,
      p.material_id,
      p.price,
      p.effective_date,
      m.name as material_name,
      m.category,
      m.manufacturer,
      m.grade,
      m.type,
      m.unit,
      u.name as distributor_name,
      u.address as distributor_address,
      u.phone as distributor_phone
    FROM prices p
    JOIN materials m ON p.material_id = m.id
    JOIN users u ON p.distributor_id = u.id
    WHERE p.effective_date = (
      SELECT MAX(effective_date)
      FROM prices
      WHERE material_id = p.material_id AND distributor_id = p.distributor_id
    )
    ORDER BY m.category, m.name, p.price
  `, (err, prices) => {
    if (err) {
      console.error('Error fetching all prices:', err);
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }
    res.json(prices);
  });
});

// Update price for a material
router.post('/', authenticateToken, authorizeRole('distributor'), (req, res) => {
  const { materialId, price, effectiveDate } = req.body;

  if (!materialId || price === undefined || price < 0) {
    return res.status(400).json({ error: 'Material ID and valid price are required' });
  }

  const date = effectiveDate || new Date().toISOString().split('T')[0];

  db.run(`
    INSERT INTO prices (distributor_id, material_id, price, effective_date)
    VALUES (?, ?, ?, ?)
  `, [req.user.id, materialId, price, date], function(err) {
    if (err) {
      console.error('Error updating price:', err);
      return res.status(500).json({ error: 'Failed to update price' });
    }

    // Create notification for consumers
    db.get('SELECT name FROM materials WHERE id = ?', [materialId], (err, material) => {
      if (!err && material) {
        db.run(`
          INSERT INTO notifications (from_user_id, to_role, title, message, type)
          VALUES (?, ?, ?, ?, ?)
        `, [req.user.id, 'consumer', 'Price Update', `New price for ${material.name}: ₹${price}`, 'price_update']);
      }
    });

    res.status(201).json({ 
      message: 'Price updated successfully', 
      priceId: this.lastID 
    });
  });
});

module.exports = router;

