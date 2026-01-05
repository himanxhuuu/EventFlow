import React, { useState } from 'react'
import axios from 'axios'
import './Modal.css'

function VendorModal({ vendor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    vendor_type: vendor?.vendor_type || 'catering',
    contact_email: vendor?.contact_email || '',
    contact_phone: vendor?.contact_phone || '',
    service_description: vendor?.service_description || '',
    price_range: vendor?.price_range || '',
    rating: vendor?.rating || 0
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
      if (vendor) {
        // Update existing vendor (if needed in future)
        alert('Update functionality coming soon')
      } else {
        await axios.post('/api/vendors', formData)
        alert('Vendor created successfully!')
        onSuccess && onSuccess()
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error saving vendor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Vendor</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vendor Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Vendor Type *</label>
            <select
              name="vendor_type"
              value={formData.vendor_type}
              onChange={handleChange}
              required
            >
              <option value="catering">Catering</option>
              <option value="decorator">Decorator</option>
              <option value="photographer">Photographer</option>
              <option value="entertainment">Entertainment</option>
              <option value="florist">Florist</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Service Description</label>
            <textarea
              name="service_description"
              value={formData.service_description}
              onChange={handleChange}
              placeholder="Describe the services offered..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price Range</label>
              <input
                type="text"
                name="price_range"
                value={formData.price_range}
                onChange={handleChange}
                placeholder="e.g., ₹50,000-₹2,00,000"
              />
            </div>

            <div className="form-group">
              <label>Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VendorModal

