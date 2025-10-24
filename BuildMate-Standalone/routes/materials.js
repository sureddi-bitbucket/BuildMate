const express = require('express');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all materials
router.get('/', authenticateToken, (req, res) => {
  const { category } = req.query;
  
  let query = 'SELECT * FROM materials';
  const params = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY category, manufacturer, name';
  
  db.all(query, params, (err, materials) => {
    if (err) {
      console.error('Error fetching materials:', err);
      return res.status(500).json({ error: 'Failed to fetch materials' });
    }
    res.json(materials);
  });
});

// Get material by ID
router.get('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM materials WHERE id = ?', [req.params.id], (err, material) => {
    if (err) {
      console.error('Error fetching material:', err);
      return res.status(500).json({ error: 'Failed to fetch material' });
    }
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json(material);
  });
});

// Add new material (admin/distributor only)
router.post('/', authenticateToken, authorizeRole('distributor', 'manufacturer'), (req, res) => {
  const { name, category, manufacturer, grade, type, description, unit } = req.body;

  if (!name || !category || !manufacturer) {
    return res.status(400).json({ error: 'Name, category, and manufacturer are required' });
  }

  db.run(`
    INSERT INTO materials (name, category, manufacturer, grade, type, description, unit)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [name, category, manufacturer, grade || null, type || null, description || null, unit || 'piece'], function(err) {
    if (err) {
      console.error('Error adding material:', err);
      return res.status(500).json({ error: 'Failed to add material' });
    }

    res.status(201).json({ 
      message: 'Material added successfully', 
      materialId: this.lastID 
    });
  });
});

// Update material
router.put('/:id', authenticateToken, authorizeRole('distributor', 'manufacturer'), (req, res) => {
  const { name, category, manufacturer, grade, type, description, unit } = req.body;
  
  db.run(`
    UPDATE materials 
    SET name = ?, category = ?, manufacturer = ?, grade = ?, type = ?, description = ?, unit = ?
    WHERE id = ?
  `, [name, category, manufacturer, grade || null, type || null, description || null, unit || 'piece', req.params.id], function(err) {
    if (err) {
      console.error('Error updating material:', err);
      return res.status(500).json({ error: 'Failed to update material' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material updated successfully' });
  });
});

// Delete material
router.delete('/:id', authenticateToken, authorizeRole('distributor', 'manufacturer'), (req, res) => {
  db.run('DELETE FROM materials WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting material:', err);
      return res.status(500).json({ error: 'Failed to delete material' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  });
});

// Get materials grouped by category
router.get('/grouped/categories', authenticateToken, (req, res) => {
  db.all('SELECT * FROM materials ORDER BY category, manufacturer, name', (err, materials) => {
    if (err) {
      console.error('Error fetching grouped materials:', err);
      return res.status(500).json({ error: 'Failed to fetch materials' });
    }

    const grouped = materials.reduce((acc, material) => {
      if (!acc[material.category]) {
        acc[material.category] = [];
      }
      acc[material.category].push(material);
      return acc;
    }, {});

    res.json(grouped);
  });
});

module.exports = router;

