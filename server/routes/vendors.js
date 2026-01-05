const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const locationService = require('../services/locationService');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all vendors
router.get('/', (req, res) => {
  const db = getDb();
  const { type } = req.query;
  
  let query = 'SELECT * FROM vendors';
  const params = [];
  
  if (type) {
    query += ' WHERE vendor_type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY rating DESC, name';
  
  db.all(query, params, (err, vendors) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(vendors);
  });
});

// Get single vendor
router.get('/:id', (req, res) => {
  const db = getDb();
  db.get('SELECT * FROM vendors WHERE id = ?', [req.params.id], (err, vendor) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  });
});

// Get vendors by event
router.get('/event/:eventId', (req, res) => {
  const db = getDb();
  db.all(`SELECT v.*, ev.status as assignment_status, ev.id as assignment_id 
    FROM vendors v 
    INNER JOIN event_vendors ev ON v.id = ev.vendor_id 
    WHERE ev.event_id = ?`,
    [req.params.eventId],
    (err, vendors) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(vendors);
    }
  );
});

// Assign vendor to event
router.post('/assign', (req, res) => {
  const db = getDb();
  const { event_id, vendor_id, status } = req.body;

  // Verify event belongs to user
  db.get('SELECT * FROM events WHERE id = ?', [event_id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!event || event.user_id !== req.user.userId) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if vendor is already booked for another event that overlaps in time
    db.get(
      `SELECT e.id, e.title, e.start_date, e.end_date FROM events e
       INNER JOIN event_vendors ev ON e.id = ev.event_id
       WHERE ev.vendor_id = ?
       AND ev.event_id != ?
       AND (
         (e.start_date <= ? AND e.end_date >= ?) OR
         (e.start_date <= ? AND e.end_date >= ?) OR
         (e.start_date >= ? AND e.end_date <= ?)
       )`,
      [vendor_id, event_id, event.start_date, event.start_date, event.end_date, event.end_date, event.start_date, event.end_date],
      (checkErr, conflictEvent) => {
        if (checkErr) {
          return res.status(500).json({ error: 'Database error while checking vendor availability' });
        }
        if (conflictEvent) {
          return res.status(400).json({
            error: 'This vendor is already booked for another event in the selected time range',
            conflict: conflictEvent
          });
        }

        db.run(
          'INSERT INTO event_vendors (event_id, vendor_id, status) VALUES (?, ?, ?)',
          [event_id, vendor_id, status || 'pending'],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error assigning vendor' });
            }
            res.status(201).json({ message: 'Vendor assigned successfully', id: this.lastID });
          }
        );
      }
    );
  });
});

// Remove vendor from event
router.delete('/assign/:assignmentId', (req, res) => {
  const db = getDb();
  const assignmentId = req.params.assignmentId;

  // Verify event belongs to user
  db.get(`SELECT e.user_id FROM events e 
    INNER JOIN event_vendors ev ON e.id = ev.event_id 
    WHERE ev.id = ?`,
    [assignmentId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!result || result.user_id !== req.user.userId) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      db.run('DELETE FROM event_vendors WHERE id = ?', [assignmentId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error removing vendor' });
        }
        res.json({ message: 'Vendor removed successfully' });
      });
    }
  );
});

// Search vendors by location (real-time)
router.get('/search/location', async (req, res) => {
  const { location, type } = req.query;
  
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is required' });
  }

  try {
    const vendors = await locationService.searchVendors(location, type);
    res.json(vendors);
  } catch (error) {
    console.error('Error searching vendors:', error);
    res.status(500).json({ error: 'Error searching vendors' });
  }
});

// Create new vendor
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('vendor_type').notEmpty().withMessage('Vendor type is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, vendor_type, contact_email, contact_phone, service_description, price_range, rating, location } = req.body;
  const db = getDb();

  db.run('INSERT INTO vendors (name, vendor_type, contact_email, contact_phone, service_description, price_range, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, vendor_type, contact_email || null, contact_phone || null, service_description || null, price_range || null, rating || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating vendor' });
      }
      res.status(201).json({ message: 'Vendor created successfully', id: this.lastID });
    }
  );
});

module.exports = router;

