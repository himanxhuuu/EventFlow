const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks for an event
router.get('/event/:eventId', (req, res) => {
  const db = getDb();
  const eventId = req.params.eventId;

  // Verify event belongs to user
  db.get('SELECT user_id FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!event || event.user_id !== req.user.userId) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.all('SELECT * FROM tasks WHERE event_id = ? ORDER BY due_date ASC, priority DESC',
      [eventId],
      (err, tasks) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(tasks);
      }
    );
  });
});

// Get single task
router.get('/:id', (req, res) => {
  const db = getDb();
  db.get(`SELECT t.* FROM tasks t 
    INNER JOIN events e ON t.event_id = e.id 
    WHERE t.id = ? AND e.user_id = ?`,
    [req.params.id, req.user.userId],
    (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    }
  );
});

// Create task
router.post('/', [
  body('event_id').notEmpty().withMessage('Event ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { event_id, title, description, assigned_to, due_date, priority, status } = req.body;
  const db = getDb();

  // Verify event belongs to user
  db.get('SELECT user_id FROM events WHERE id = ?', [event_id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!event || event.user_id !== req.user.userId) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.run('INSERT INTO tasks (event_id, title, description, assigned_to, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [event_id, title, description || null, assigned_to || null, due_date || null, priority || 'medium', status || 'pending'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating task' });
        }
        res.status(201).json({ message: 'Task created successfully', id: this.lastID });
      }
    );
  });
});

// Update task
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, description, assigned_to, due_date, priority, status, reminder_sent } = req.body;

  db.run(`UPDATE tasks SET title = ?, description = ?, assigned_to = ?, due_date = ?, priority = ?, status = ?, reminder_sent = ? 
    WHERE id = ? AND event_id IN (SELECT id FROM events WHERE user_id = ?)`,
    [title, description, assigned_to, due_date, priority, status, reminder_sent, req.params.id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating task' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task updated successfully' });
    }
  );
});

// Delete task
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run(`DELETE FROM tasks 
    WHERE id = ? AND event_id IN (SELECT id FROM events WHERE user_id = ?)`,
    [req.params.id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting task' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    }
  );
});

// Get tasks due soon (for reminders)
router.get('/reminders/upcoming', (req, res) => {
  const db = getDb();
  const days = parseInt(req.query.days) || 7;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  db.all(`SELECT t.*, e.title as event_title, e.start_date as event_start_date 
    FROM tasks t 
    INNER JOIN events e ON t.event_id = e.id 
    WHERE e.user_id = ? 
    AND t.status != 'completed' 
    AND t.due_date IS NOT NULL 
    AND t.due_date <= ? 
    AND t.reminder_sent = 0
    ORDER BY t.due_date ASC`,
    [req.user.userId, futureDate.toISOString()],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(tasks);
    }
  );
});

module.exports = router;

