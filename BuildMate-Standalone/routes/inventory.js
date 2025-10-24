const express = require('express');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get inventory for logged-in distributor
router.get('/', authenticateToken, authorizeRole('distributor'), (req, res) => {
  db.all(`
    SELECT 
      i.id,
      i.distributor_id,
      i.material_id,
      i.quantity,
      i.last_updated,
      m.name as material_name,
      m.category,
      m.manufacturer,
      m.grade,
      m.type,
      m.unit
    FROM inventory i
    JOIN materials m ON i.material_id = m.id
    WHERE i.distributor_id = ?
    ORDER BY m.category, m.name
  `, [req.user.id], (err, inventory) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }
    res.json(inventory);
  });
});

// Get inventory for a specific distributor (for consumers)
router.get('/distributor/:distributorId', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      i.id,
      i.material_id,
      i.quantity,
      i.last_updated,
      m.name as material_name,
      m.category,
      m.manufacturer,
      m.grade,
      m.type,
      m.unit,
      p.price,
      p.effective_date
    FROM inventory i
    JOIN materials m ON i.material_id = m.id
    LEFT JOIN (
      SELECT material_id, distributor_id, price, effective_date
      FROM prices
      WHERE (material_id, effective_date) IN (
        SELECT material_id, MAX(effective_date)
        FROM prices
        WHERE distributor_id = ?
        GROUP BY material_id
      )
    ) p ON i.material_id = p.material_id AND i.distributor_id = p.distributor_id
    WHERE i.distributor_id = ? AND i.quantity > 0
    ORDER BY m.category, m.name
  `, [req.params.distributorId, req.params.distributorId], (err, inventory) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }
    res.json(inventory);
  });
});

// Update inventory
router.put('/:materialId', authenticateToken, authorizeRole('distributor'), (req, res) => {
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  // Check if inventory exists
  db.get(`
    SELECT * FROM inventory WHERE distributor_id = ? AND material_id = ?
  `, [req.user.id, req.params.materialId], (err, existing) => {
    if (err) {
      console.error('Error checking inventory:', err);
      return res.status(500).json({ error: 'Failed to update inventory' });
    }

    if (existing) {
      // Update existing inventory
      db.run(`
        UPDATE inventory 
        SET quantity = ?, last_updated = CURRENT_TIMESTAMP
        WHERE distributor_id = ? AND material_id = ?
      `, [quantity, req.user.id, req.params.materialId], function(err) {
        if (err) {
          console.error('Error updating inventory:', err);
          return res.status(500).json({ error: 'Failed to update inventory' });
        }
        res.json({ message: 'Inventory updated successfully' });
      });
    } else {
      // Insert new inventory
      db.run(`
        INSERT INTO inventory (distributor_id, material_id, quantity)
        VALUES (?, ?, ?)
      `, [req.user.id, req.params.materialId, quantity], function(err) {
        if (err) {
          console.error('Error adding inventory:', err);
          return res.status(500).json({ error: 'Failed to add inventory' });
        }
        res.json({ message: 'Inventory added successfully' });
      });
    }
  });
});

module.exports = router;

