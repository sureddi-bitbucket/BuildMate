const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications for logged-in user
router.get('/', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      n.*,
      u.name as from_user_name,
      u.role as from_user_role
    FROM notifications n
    JOIN users u ON n.from_user_id = u.id
    WHERE n.to_user_id = ? OR (n.to_role = ? AND n.to_user_id IS NULL)
    ORDER BY n.created_at DESC
    LIMIT 100
  `, [req.user.id, req.user.role], (err, notifications) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json(notifications);
  });
});

// Get unread notification count
router.get('/unread-count', authenticateToken, (req, res) => {
  db.get(`
    SELECT COUNT(*) as count
    FROM notifications
    WHERE (to_user_id = ? OR (to_role = ? AND to_user_id IS NULL))
      AND is_read = 0
  `, [req.user.id, req.user.role], (err, result) => {
    if (err) {
      console.error('Error fetching unread count:', err);
      return res.status(500).json({ error: 'Failed to fetch unread count' });
    }
    res.json({ count: result.count });
  });
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  db.run(`
    UPDATE notifications
    SET is_read = 1
    WHERE id = ? AND (to_user_id = ? OR to_role = ?)
  `, [req.params.id, req.user.id, req.user.role], function(err) {
    if (err) {
      console.error('Error marking notification as read:', err);
      return res.status(500).json({ error: 'Failed to mark notification as read' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  });
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, (req, res) => {
  db.run(`
    UPDATE notifications
    SET is_read = 1
    WHERE to_user_id = ? OR (to_role = ? AND to_user_id IS NULL)
  `, [req.user.id, req.user.role], (err) => {
    if (err) {
      console.error('Error marking all notifications as read:', err);
      return res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
    res.json({ message: 'All notifications marked as read' });
  });
});

// Send notification
router.post('/', authenticateToken, (req, res) => {
  const { toUserId, toRole, title, message, type } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  if (!toUserId && !toRole) {
    return res.status(400).json({ error: 'Either toUserId or toRole is required' });
  }

  db.run(`
    INSERT INTO notifications (from_user_id, to_user_id, to_role, title, message, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [req.user.id, toUserId || null, toRole || null, title, message, type || 'info'], function(err) {
    if (err) {
      console.error('Error sending notification:', err);
      return res.status(500).json({ error: 'Failed to send notification' });
    }

    res.status(201).json({ 
      message: 'Notification sent successfully', 
      notificationId: this.lastID 
    });
  });
});

// Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  db.run(`
    DELETE FROM notifications
    WHERE id = ? AND (to_user_id = ? OR to_role = ?)
  `, [req.params.id, req.user.id, req.user.role], function(err) {
    if (err) {
      console.error('Error deleting notification:', err);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  });
});

module.exports = router;

