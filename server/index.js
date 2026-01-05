const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const venueRoutes = require('./routes/venues');
const vendorRoutes = require('./routes/vendors');
const taskRoutes = require('./routes/tasks');
const guestRoutes = require('./routes/guests');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
try {
  initDatabase();
  console.log('Database initialization started');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/guests', guestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Event Management API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Event Management API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      events: '/api/events',
      venues: '/api/venues',
      vendors: '/api/vendors',
      tasks: '/api/tasks',
      guests: '/api/guests'
    },
    note: 'Access the frontend at http://localhost:3000'
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`Frontend should be accessed at http://localhost:3000`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('Please stop the process using this port or change PORT in .env file');
    console.error('\nTo find and kill the process:');
    console.error(`  netstat -ano | findstr :${PORT}`);
    console.error('  taskkill /PID <PID> /F');
  } else {
    console.error('Error starting server:', err);
  }
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

