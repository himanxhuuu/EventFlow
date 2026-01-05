const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all events for the authenticated user
router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM events WHERE user_id = ? ORDER BY start_date DESC', 
    [req.user.userId], 
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(events);
    }
  );
});

// Get single event
router.get('/:id', (req, res) => {
  const db = getDb();
  db.get('SELECT * FROM events WHERE id = ? AND user_id = ?', 
    [req.params.id, req.user.userId], 
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    }
  );
});

// Create event
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('event_type').notEmpty().withMessage('Event type is required'),
  body('start_date').notEmpty().withMessage('Start date is required'),
  body('end_date').notEmpty().withMessage('End date is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, event_type, start_date, end_date, venue_id, status } = req.body;
  const db = getDb();

  const insertEvent = () => {
    db.run(
      'INSERT INTO events (user_id, title, description, event_type, start_date, end_date, venue_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, title, description || null, event_type, start_date, end_date, venue_id || null, status || 'planning'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating event' });
        }
        res.status(201).json({ message: 'Event created successfully', id: this.lastID });
      }
    );
  };

  // If a venue is selected, ensure it is not already booked for the given time range
  if (venue_id) {
    db.get(
      `SELECT id, title, start_date, end_date FROM events
       WHERE venue_id = ?
       AND (
         (start_date <= ? AND end_date >= ?) OR
         (start_date <= ? AND end_date >= ?) OR
         (start_date >= ? AND end_date <= ?)
       )`,
      [venue_id, start_date, start_date, end_date, end_date, start_date, end_date],
      (err, conflictEvent) => {
        if (err) {
          return res.status(500).json({ error: 'Database error while checking venue availability' });
        }
        if (conflictEvent) {
          return res.status(400).json({
            error: 'This venue is already booked for the selected time range',
            conflict: conflictEvent
          });
        }
        insertEvent();
      }
    );
  } else {
    insertEvent();
  }
});

// Update event
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, description, event_type, start_date, end_date, venue_id, status } = req.body;

  const updateEvent = () => {
    db.run(
      'UPDATE events SET title = ?, description = ?, event_type = ?, start_date = ?, end_date = ?, venue_id = ?, status = ? WHERE id = ? AND user_id = ?',
      [title, description, event_type, start_date, end_date, venue_id, status, req.params.id, req.user.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error updating event' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event updated successfully' });
      }
    );
  };

  // If a venue is selected, ensure it is not already booked for the given time range
  if (venue_id) {
    db.get(
      `SELECT id, title, start_date, end_date FROM events
       WHERE venue_id = ?
       AND id != ?
       AND (
         (start_date <= ? AND end_date >= ?) OR
         (start_date <= ? AND end_date >= ?) OR
         (start_date >= ? AND end_date <= ?)
       )`,
      [venue_id, req.params.id, start_date, start_date, end_date, end_date, start_date, end_date],
      (err, conflictEvent) => {
        if (err) {
          return res.status(500).json({ error: 'Database error while checking venue availability' });
        }
        if (conflictEvent) {
          return res.status(400).json({
            error: 'This venue is already booked for the selected time range',
            conflict: conflictEvent
          });
        }
        updateEvent();
      }
    );
  } else {
    updateEvent();
  }
});

// Delete event
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM events WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting event' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
    }
  );
});

module.exports = router;

