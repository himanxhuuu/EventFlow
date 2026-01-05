import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import './Dashboard.css'

function Dashboard() {
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events')
      const eventsData = response.data
      setEvents(eventsData)
      
      const now = new Date()
      const upcoming = eventsData.filter(e => new Date(e.start_date) > now).length
      const completed = eventsData.filter(e => new Date(e.end_date) < now).length
      
      setStats({
        total: eventsData.length,
        upcoming,
        completed
      })
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  const upcomingEvents = events
    .filter(e => new Date(e.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 5)

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Events</h3>
          <p className="stat-number">{stats.upcoming}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Events</h3>
          <p className="stat-number">{stats.completed}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Upcoming Events</h2>
          <Link to="/events" className="btn btn-secondary">View All</Link>
        </div>
        
        {upcomingEvents.length === 0 ? (
          <div className="empty-state">
            <h3>No upcoming events</h3>
            <p>Create your first event to get started!</p>
            <Link to="/events" className="btn btn-primary">
              Create Event
            </Link>
          </div>
        ) : (
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className="event-card-link">
                <div className="event-card">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span className={`badge badge-${event.status === 'completed' ? 'success' : 'info'}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="event-type">{event.event_type}</p>
                  <p className="event-date">
                    {format(new Date(event.start_date), 'MMM dd, yyyy')} - {format(new Date(event.end_date), 'MMM dd, yyyy')}
                  </p>
                  {event.description && (
                    <p className="event-description">{event.description.substring(0, 100)}...</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

