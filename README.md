# Event Management Application

A comprehensive event management system for organizing weddings, corporate events, birthday parties, and cultural programs. This application simplifies event planning by providing automated scheduling, task management, venue booking, and vendor coordination.

## Features

### Core Functionalities

1. **Event Planning**
   - Create and manage events (weddings, corporate events, birthdays, cultural programs)
   - Track event status (planning, confirmed, in-progress, completed, cancelled)
   - View event details and timeline

2. **Automated Scheduling & Task Management**
   - Create tasks with priorities (low, medium, high)
   - Assign tasks to team members
   - Set due dates and track task status
   - Automated reminders for upcoming tasks

3. **Venue & Vendor Management**
   - Browse available venues with capacity and pricing
   - Check venue availability for date ranges
   - **Location-based venue search** - Search for venues in any location
   - **Add custom venues** - Create and save your own venues
   - Browse vendors by type (catering, decoration, photography, entertainment, florist)
   - **Location-based vendor search** - Find vendors in specific locations
   - **Add custom vendors** - Create and save your own vendors
   - Assign vendors to events
   - Track vendor ratings and pricing

4. **Guest Management**
   - Add and manage guest lists
   - Track RSVP status (pending, confirmed, declined)
   - Record dietary restrictions
   - **Send email invitations** - Send personalized email invitations to all guests
   - View guest statistics

5. **User Authentication**
   - Secure user registration and login
   - JWT-based authentication
   - User-specific event management

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with React Router
- **Vite** for build tooling
- **Axios** for API calls
- **date-fns** for date formatting

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory (copy from `server/.env.example`):
   ```env
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   
   # Optional: Email Configuration (for sending real emails)
   # If not configured, emails will use Ethereal Email (fake SMTP for testing)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Optional: Google Places API (for real-time location search)
   GOOGLE_PLACES_API_KEY=your-google-places-api-key
   ```
   
   **Note:** 
   - For email: Use Gmail with an App Password, or configure your own SMTP server
   - For location search: Get a free API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Without these, the app will work with mock data for location search and Ethereal Email for testing

5. **Start the application**
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   This will start both the backend server (port 5000) and frontend development server (port 3000).

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

## Usage

### Default Login Credentials
- **Email:** admin@example.com
- **Password:** admin123

### Creating Your First Event

1. Login to the application
2. Navigate to "Events" from the dashboard
3. Click "Create New Event"
4. Fill in event details:
   - Title
   - Event type (wedding, corporate, birthday, cultural)
   - Start and end dates
   - Optional venue selection
   - Description
5. Save the event

### Managing Tasks

1. Open an event from the Events page
2. Click on the "Tasks" tab
3. Click "Add Task" to create new tasks
4. Set priority, due date, and assign to team members
5. Update task status as you progress

### Adding Vendors

1. Navigate to "Vendors" page
2. Browse available vendors by type
3. Select an event from the dropdown
4. Click "Assign to Event" on any vendor card
5. View assigned vendors in the event detail page

### Managing Guests

1. Open an event
2. Click on the "Guests" tab
3. Click "Add Guest" to add guests (make sure to add email addresses)
4. Update RSVP status and dietary restrictions
5. Click "📧 Send Emails" to send invitation emails to all guests with email addresses
6. View guest statistics in the Overview tab

### Searching Venues by Location

1. Navigate to "Venues" page
2. Enter a location (e.g., "New York", "Los Angeles") in the search box
3. Click "🔍 Search Location" to find venues in that location
4. Click "Add to My Venues" on any search result to save it
5. Or click "+ Add Venue" to manually create a new venue

### Searching Vendors by Location

1. Navigate to "Vendors" page
2. Enter a location in the search box
3. Optionally filter by vendor type before searching
4. Click "🔍 Search Location" to find vendors in that location
5. Click "Add to List" on any search result to save it
6. Or click "+ Add Vendor" to manually create a new vendor

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all user events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get single venue
- `GET /api/venues/available/:startDate/:endDate` - Get available venues

### Vendors
- `GET /api/vendors` - Get all vendors (optional ?type= filter)
- `GET /api/vendors/:id` - Get single vendor
- `GET /api/vendors/event/:eventId` - Get vendors for event
- `POST /api/vendors/assign` - Assign vendor to event
- `DELETE /api/vendors/assign/:assignmentId` - Remove vendor from event

### Tasks
- `GET /api/tasks/event/:eventId` - Get tasks for event
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/reminders/upcoming` - Get tasks due soon

### Guests
- `GET /api/guests/event/:eventId` - Get guests for event
- `GET /api/guests/:id` - Get single guest
- `POST /api/guests` - Add guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest
- `GET /api/guests/event/:eventId/stats` - Get RSVP statistics

## Project Structure

```
event-management-app/
├── server/
│   ├── database/
│   │   └── init.js          # Database initialization
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── events.js        # Event routes
│   │   ├── venues.js        # Venue routes
│   │   ├── vendors.js       # Vendor routes
│   │   ├── tasks.js         # Task routes
│   │   └── guests.js        # Guest routes
│   ├── index.js             # Server entry point
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (Auth)
│   │   └── main.jsx         # App entry point
│   └── package.json
└── package.json
```

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts
- `events` - Event information
- `venues` - Venue details
- `vendors` - Vendor information
- `event_vendors` - Event-vendor relationships
- `tasks` - Task management
- `guests` - Guest lists

## Future Enhancements

- Email notifications for task reminders
- Calendar view for events
- File uploads for event documents
- Budget tracking
- Real-time collaboration
- Mobile app version
- Integration with payment gateways

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

