import React, { useState } from 'react'
import axios from 'axios'
import './Modal.css'

function VenueModal({ venue, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: venue?.name || '',
    address: venue?.address || '',
    capacity: venue?.capacity || '',
    price_per_day: venue?.price_per_day || '',
    amenities: venue?.amenities || '',
    availability_status: venue?.availability_status || 'available'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      if (venue) {
        // Update existing venue (if needed in future)
        alert('Update functionality coming soon')
      } else {
        await axios.post('/api/venues', formData)
        alert('Venue created successfully!')
        onSuccess && onSuccess()
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error saving venue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Venue</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Venue Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Price per Day (₹) *</label>
              <input
                type="number"
                name="price_per_day"
                value={formData.price_per_day}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Amenities</label>
            <textarea
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="e.g., WiFi, Parking, Catering Kitchen, AV Equipment"
            />
          </div>

          <div className="form-group">
            <label>Availability Status</label>
            <select
              name="availability_status"
              value={formData.availability_status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Create Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VenueModal

