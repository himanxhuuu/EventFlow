import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Modal.css'

function GuestModal({ guest, eventId, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rsvp_status: 'pending',
    dietary_restrictions: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        rsvp_status: guest.rsvp_status || 'pending',
        dietary_restrictions: guest.dietary_restrictions || ''
      })
    }
  }, [guest])

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
        event_id: eventId
      }

      if (guest) {
        await axios.put(`/api/guests/${guest.id}`, data)
        // Check if RSVP status changed
        if (guest.rsvp_status !== formData.rsvp_status && formData.email) {
          alert('Guest updated! RSVP confirmation email will be sent if email is provided.')
        }
      } else {
        await axios.post('/api/guests', data)
      }
      
      alert(guest ? 'Guest updated successfully!' : 'Guest added successfully!')
      onClose()
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ')
        setError(errorMessages)
      } else {
        setError(error.response?.data?.error || error.message || 'Error saving guest')
      }
      console.error('Error saving guest:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{guest ? 'Edit Guest' : 'Add Guest'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>RSVP Status</label>
            <select
              name="rsvp_status"
              value={formData.rsvp_status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dietary Restrictions</label>
            <textarea
              name="dietary_restrictions"
              value={formData.dietary_restrictions}
              onChange={handleChange}
              placeholder="e.g., Vegetarian, Gluten-free, Allergies..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : guest ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GuestModal

