const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const locationService = require('../services/locationService');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all venues
router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM venues ORDER BY name', (err, venues) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(venues);
  });
});

// Get single venue
router.get('/:id', (req, res) => {
  const db = getDb();
  db.get('SELECT * FROM venues WHERE id = ?', [req.params.id], (err, venue) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(venue);
  });
});

// Get available venues for a date range
router.get('/available/:startDate/:endDate', (req, res) => {
  const db = getDb();
  const { startDate, endDate } = req.params;

  // Get venues that are not booked during the specified date range
  db.all(`SELECT v.* FROM venues v 
    WHERE v.availability_status = 'available' 
    AND v.id NOT IN (
      SELECT DISTINCT venue_id FROM events 
      WHERE venue_id IS NOT NULL 
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    )`,
    [startDate, startDate, endDate, endDate, startDate, endDate],
    (err, venues) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(venues);
    }
  );
});

// Search venues by location (real-time)
router.get('/search/location', async (req, res) => {
  const { location, query } = req.query;
  
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is required' });
  }

  try {
    const venues = await locationService.searchVenues(location, query);
    res.json(venues);
  } catch (error) {
    console.error('Error searching venues:', error);
    res.status(500).json({ error: 'Error searching venues' });
  }
});

// Create new venue
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('price_per_day').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, address, capacity, price_per_day, amenities, availability_status } = req.body;
  const db = getDb();

  db.run('INSERT INTO venues (name, address, capacity, price_per_day, amenities, availability_status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, address, parseInt(capacity), parseFloat(price_per_day), amenities || null, availability_status || 'available'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating venue' });
      }
      res.status(201).json({ message: 'Venue created successfully', id: this.lastID });
    }
  );
});

module.exports = router;

