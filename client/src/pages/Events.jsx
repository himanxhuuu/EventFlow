import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import EventModal from '../components/EventModal'
import './Events.css'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events')
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEvent(null)
    setShowModal(true)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await axios.delete(`/api/events/${id}`)
      fetchEvents()
    } catch (error) {
      alert('Error deleting event')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingEvent(null)
    fetchEvents()
  }

  if (loading) {
    return <div className="loading">Loading events...</div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Events</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          Create New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <h3>No events yet</h3>
          <p>Create your first event to get started!</p>
          <button onClick={handleCreate} className="btn btn-primary" style={{ marginTop: '20px' }}>
            Create Event
          </button>
        </div>
      ) : (
        <div className="events-list">
          {events.map(event => (
            <div key={event.id} className="event-item">
              <div className="event-item-content">
                <div className="event-item-header">
                  <Link to={`/events/${event.id}`}>
                    <h3>{event.title}</h3>
                  </Link>
                  <span className={`badge badge-${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="event-item-type">{event.event_type}</p>
                <p className="event-item-date">
                  {format(new Date(event.start_date), 'MMM dd, yyyy HH:mm')} - 
                  {format(new Date(event.end_date), 'MMM dd, yyyy HH:mm')}
                </p>
                {event.description && (
                  <p className="event-item-description">{event.description}</p>
                )}
              </div>
              <div className="event-item-actions">
                <button onClick={() => handleEdit(event)} className="btn btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(event.id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <EventModal
          event={editingEvent}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

function getStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'planning':
      return 'info'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}

export default Events

