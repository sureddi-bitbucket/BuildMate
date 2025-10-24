const express = require('express');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get inquiries for distributor
router.get('/received', authenticateToken, authorizeRole('distributor'), (req, res) => {
  db.all(`
    SELECT 
      inq.*,
      u.name as consumer_name,
      u.phone as consumer_phone,
      u.email as consumer_email,
      m.name as material_name,
      m.category,
      m.manufacturer,
      m.unit
    FROM inquiries inq
    JOIN users u ON inq.consumer_id = u.id
    JOIN materials m ON inq.material_id = m.id
    WHERE inq.distributor_id = ?
    ORDER BY inq.created_at DESC
  `, [req.user.id], (err, inquiries) => {
    if (err) {
      console.error('Error fetching received inquiries:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
    res.json(inquiries);
  });
});

// Get inquiries sent by consumer
router.get('/sent', authenticateToken, authorizeRole('consumer'), (req, res) => {
  db.all(`
    SELECT 
      inq.*,
      u.name as distributor_name,
      u.phone as distributor_phone,
      u.email as distributor_email,
      u.address as distributor_address,
      m.name as material_name,
      m.category,
      m.manufacturer,
      m.unit
    FROM inquiries inq
    JOIN users u ON inq.distributor_id = u.id
    JOIN materials m ON inq.material_id = m.id
    WHERE inq.consumer_id = ?
    ORDER BY inq.created_at DESC
  `, [req.user.id], (err, inquiries) => {
    if (err) {
      console.error('Error fetching sent inquiries:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
    res.json(inquiries);
  });
});

// Create new inquiry (consumer to distributor)
router.post('/', authenticateToken, authorizeRole('consumer'), (req, res) => {
  const { distributorId, materialId, quantity, message } = req.body;

  if (!distributorId || !materialId) {
    return res.status(400).json({ error: 'Distributor and material are required' });
  }

  db.run(`
    INSERT INTO inquiries (consumer_id, distributor_id, material_id, quantity, message)
    VALUES (?, ?, ?, ?, ?)
  `, [req.user.id, distributorId, materialId, quantity || null, message || null], function(err) {
    if (err) {
      console.error('Error creating inquiry:', err);
      return res.status(500).json({ error: 'Failed to create inquiry' });
    }

    // Create notification for distributor
    db.get('SELECT name FROM materials WHERE id = ?', [materialId], (err, material) => {
      if (!err && material) {
        db.run(`
          INSERT INTO notifications (from_user_id, to_user_id, title, message, type)
          VALUES (?, ?, ?, ?, ?)
        `, [req.user.id, distributorId, 'New Inquiry', `Inquiry received for ${material.name}${quantity ? ` (${quantity} units)` : ''}`, 'inquiry']);
      }
    });

    res.status(201).json({ 
      message: 'Inquiry sent successfully', 
      inquiryId: this.lastID 
    });
  });
});

// Update inquiry status
router.put('/:id/status', authenticateToken, authorizeRole('distributor'), (req, res) => {
  const { status } = req.body;

  if (!['pending', 'responded', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(`
    UPDATE inquiries
    SET status = ?
    WHERE id = ? AND distributor_id = ?
  `, [status, req.params.id, req.user.id], function(err) {
    if (err) {
      console.error('Error updating inquiry status:', err);
      return res.status(500).json({ error: 'Failed to update inquiry status' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry status updated successfully' });
  });
});

module.exports = router;

