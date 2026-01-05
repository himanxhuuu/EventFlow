import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Modal.css'

function EventModal({ event, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'wedding',
    start_date: '',
    end_date: '',
    venue_id: '',
    status: 'planning'
  })
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVenues()
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'wedding',
        start_date: event.start_date ? event.start_date.slice(0, 16) : '',
        end_date: event.end_date ? event.end_date.slice(0, 16) : '',
        venue_id: event.venue_id || '',
        status: event.status || 'planning'
      })
    }
  }, [event])

  const fetchVenues = async () => {
    try {
      const response = await axios.get('/api/venues')
      setVenues(response.data)
    } catch (error) {
      console.error('Error fetching venues:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        venue_id: formData.venue_id || null
      }

      if (event) {
        await axios.put(`/api/events/${event.id}`, data)
      } else {
        await axios.post('/api/events', data)
      }
      
      // Show success message
      alert(event ? 'Event updated successfully!' : 'Event created successfully!')
      onClose()
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ')
        setError(errorMessages)
      } else {
        setError(error.response?.data?.error || error.message || 'Error saving event')
      }
      console.error('Error saving event:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Event Type *</label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              required
            >
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate Event</option>
              <option value="birthday">Birthday Party</option>
              <option value="cultural">Cultural Program</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date & Time *</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Venue</label>
            <select
              name="venue_id"
              value={formData.venue_id}
              onChange={handleChange}
            >
              <option value="">Select a venue (optional)</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.address} (Capacity: {venue.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="planning">Planning</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal

