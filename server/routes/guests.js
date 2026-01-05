const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all guests for an event
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

    db.all('SELECT * FROM guests WHERE event_id = ? ORDER BY name',
      [eventId],
      (err, guests) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(guests);
      }
    );
  });
});

// Get single guest
router.get('/:id', (req, res) => {
  const db = getDb();
  db.get(`SELECT g.* FROM guests g 
    INNER JOIN events e ON g.event_id = e.id 
    WHERE g.id = ? AND e.user_id = ?`,
    [req.params.id, req.user.userId],
    (err, guest) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      res.json(guest);
    }
  );
});

// Create guest
router.post('/', [
  body('event_id').notEmpty().withMessage('Event ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { event_id, name, email, phone, rsvp_status, dietary_restrictions } = req.body;
  const db = getDb();

  // Verify event belongs to user
  db.get('SELECT user_id FROM events WHERE id = ?', [event_id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!event || event.user_id !== req.user.userId) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.run('INSERT INTO guests (event_id, name, email, phone, rsvp_status, dietary_restrictions) VALUES (?, ?, ?, ?, ?, ?)',
      [event_id, name, email || null, phone || null, rsvp_status || 'pending', dietary_restrictions || null],
      function(err) {
        if (err) {
          console.error('Error creating guest:', err);
          return res.status(500).json({ error: 'Error creating guest: ' + err.message });
        }
        res.status(201).json({ message: 'Guest added successfully', id: this.lastID });
      }
    );
  });
});

// Update guest
router.put('/:id', async (req, res) => {
  const db = getDb();
  const { name, email, phone, rsvp_status, dietary_restrictions } = req.body;

  // Get old guest data to check if RSVP status changed
  db.get(`SELECT g.*, e.title as event_title, e.start_date as event_start_date 
    FROM guests g 
    INNER JOIN events e ON g.event_id = e.id 
    WHERE g.id = ? AND e.user_id = ?`,
    [req.params.id, req.user.userId],
    async (err, oldGuest) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!oldGuest) {
        return res.status(404).json({ error: 'Guest not found' });
      }

      // Update guest
      db.run(`UPDATE guests SET name = ?, email = ?, phone = ?, rsvp_status = ?, dietary_restrictions = ? 
        WHERE id = ? AND event_id IN (SELECT id FROM events WHERE user_id = ?)`,
        [name, email, phone, rsvp_status, dietary_restrictions, req.params.id, req.user.userId],
        async function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error updating guest' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Guest not found' });
          }

          // Send RSVP confirmation email if status changed and guest has email
          if (oldGuest.rsvp_status !== rsvp_status && email && email.trim() !== '') {
            try {
              const emailService = require('../services/emailService');
              const eventData = {
                title: oldGuest.event_title,
                start_date: oldGuest.event_start_date,
                event_type: 'event'
              };
              
              await emailService.sendRSVPConfirmation({
                name: name,
                email: email,
                rsvp_status: rsvp_status,
                event: eventData
              });
              console.log(`RSVP confirmation email sent to ${email}`);
            } catch (emailErr) {
              console.error('Error sending RSVP confirmation email:', emailErr);
              // Don't fail the request if email fails
            }
          }

          res.json({ message: 'Guest updated successfully' });
        }
      );
    }
  );
});

// Delete guest
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run(`DELETE FROM guests 
    WHERE id = ? AND event_id IN (SELECT id FROM events WHERE user_id = ?)`,
    [req.params.id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting guest' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      res.json({ message: 'Guest deleted successfully' });
    }
  );
});

// Get RSVP statistics for an event
router.get('/event/:eventId/stats', (req, res) => {
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

    db.all(`SELECT rsvp_status, COUNT(*) as count 
      FROM guests 
      WHERE event_id = ? 
      GROUP BY rsvp_status`,
      [eventId],
      (err, stats) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(stats);
      }
    );
  });
});

// Send email to guests
router.post('/send-emails/:eventId', async (req, res) => {
  const db = getDb();
  const eventId = req.params.eventId;
  const { subject, message } = req.body;

  // Verify event belongs to user
  db.get('SELECT * FROM events WHERE id = ? AND user_id = ?', [eventId, req.user.userId], async (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get all guests with email addresses
    db.all('SELECT * FROM guests WHERE event_id = ? AND email IS NOT NULL AND email != ""', 
      [eventId],
      async (err, guests) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (guests.length === 0) {
          return res.status(400).json({ error: 'No guests with email addresses found' });
        }

        try {
          const emailService = require('../services/emailService');
          const results = await emailService.sendEventInvitations(guests, event, subject, message);

          res.json({
            message: `Email sending completed`,
            sent: results.sent,
            failed: results.failed,
            total: guests.length
          });
        } catch (emailError) {
          console.error('Error in email service:', emailError);
          res.status(500).json({ 
            error: 'Error sending emails: ' + (emailError.message || 'Unknown error'),
            details: process.env.NODE_ENV === 'development' ? emailError.stack : undefined
          });
        }
      }
    );
  });
});

module.exports = router;

