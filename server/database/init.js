const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure database directory exists
const DB_DIR = __dirname;
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'events.db');

let db;

const initDatabase = () => {
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      console.error('Full error:', err);
      console.error('Database path:', DB_PATH);
      // Don't throw, just log - let the app continue
    } else {
      console.log('Connected to SQLite database');
      createTables();
    }
  });
};

const createTables = () => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    venue_id INTEGER,
    status TEXT DEFAULT 'planning',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  )`);

  // Venues table
  db.run(`CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    price_per_day REAL NOT NULL,
    amenities TEXT,
    availability_status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, address)
  )`);

  // Vendors table
  db.run(`CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    vendor_type TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    service_description TEXT,
    price_range TEXT,
    rating REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, vendor_type)
  )`);

  // Event Vendors (many-to-many relationship)
  db.run(`CREATE TABLE IF NOT EXISTS event_vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
  )`);

  // Tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT,
    due_date DATETIME,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    reminder_sent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
  )`);

  // Guests table
  db.run(`CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rsvp_status TEXT DEFAULT 'pending',
    dietary_restrictions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
  )`);

  // Insert sample data
  setTimeout(() => {
    insertSampleData();
  }, 1000);
};

const insertSampleData = () => {
  // Check if sample data already exists
  db.get('SELECT COUNT(*) as count FROM venues', (err, result) => {
    if (err) {
      console.error('Error checking venues:', err);
      return;
    }

    // Only insert if database is empty
    if (result.count > 0) {
      console.log('Sample data already exists, skipping insertion');
      return;
    }

    console.log('Inserting sample data...');

    // Create default admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (id, name, email, password) 
      VALUES (1, 'Admin User', 'admin@example.com', ?)`, [hashedPassword]);

    // Insert sample venues
    const venues = [
      ['Grand Ballroom', '123 Main Street, City', 500, 5000, 'WiFi, Parking, Catering Kitchen', 'available'],
      ['Garden Pavilion', '456 Park Avenue, City', 200, 3000, 'Outdoor Space, Garden, Parking', 'available'],
      ['Conference Center', '789 Business District, City', 300, 4000, 'AV Equipment, WiFi, Breakout Rooms', 'available'],
      ['Beach Resort', '321 Coastal Highway, City', 150, 6000, 'Beach Access, Pool, Restaurant', 'available']
    ];

    venues.forEach(venue => {
      db.run(`INSERT INTO venues (name, address, capacity, price_per_day, amenities, availability_status) 
        VALUES (?, ?, ?, ?, ?, ?)`, venue, (err) => {
        if (err) {
          console.error('Error inserting venue:', err);
        }
      });
    });

    // Insert sample vendors
    const vendors = [
      ['Delicious Catering', 'catering', 'catering@example.com', '555-0101', 'Full-service catering for all events', '₹50-₹100 per person', 4.5],
      ['Elegant Decorations', 'decorator', 'decor@example.com', '555-0102', 'Wedding and event decoration services', '₹2,000-₹5,000', 4.8],
      ['Perfect Moments Photography', 'photographer', 'photo@example.com', '555-0103', 'Professional event photography', '₹1,500-₹3,000', 4.7],
      ['Sound & Light Pro', 'entertainment', 'sound@example.com', '555-0104', 'DJ, sound system, and lighting', '₹1,000-₹2,500', 4.6],
      ['Floral Designs', 'florist', 'floral@example.com', '555-0105', 'Custom floral arrangements', '₹500-₹2,000', 4.9]
    ];

    vendors.forEach(vendor => {
      db.run(`INSERT INTO vendors (name, vendor_type, contact_email, contact_phone, service_description, price_range, rating) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, vendor, (err) => {
        if (err) {
          console.error('Error inserting vendor:', err);
        }
      });
    });

    console.log('Sample data inserted successfully');
  });
};

const getDb = () => {
  if (!db) {
    console.warn('Database not initialized, initializing now...');
    initDatabase();
  }
  return db;
};

module.exports = { initDatabase, getDb };

