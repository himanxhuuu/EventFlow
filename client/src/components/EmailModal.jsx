import React, { useState } from 'react'
import axios from 'axios'
import './Modal.css'

function EmailModal({ event, guests, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    subject: `Invitation: ${event?.title || ''}`,
    message: ''
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
      const response = await axios.post(`/api/guests/send-emails/${event.id}`, {
        subject: formData.subject,
        message: formData.message
      })
      
      alert(`Emails sent successfully!\nSent: ${response.data.sent.length}\nFailed: ${response.data.failed.length}`)
      if (response.data.failed.length > 0) {
        console.log('Failed emails:', response.data.failed)
      }
      onSuccess && onSuccess(response.data)
      onClose()
    } catch (error) {
      setError(error.response?.data?.error || 'Error sending emails')
    } finally {
      setLoading(false)
    }
  }

  const guestsWithEmail = guests.filter(g => g.email && g.email.trim() !== '')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Send Email Invitations</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        {guestsWithEmail.length === 0 ? (
          <div className="alert alert-info">
            No guests with email addresses found. Please add email addresses to your guests first.
          </div>
        ) : (
          <>
            <div className="alert alert-info">
              This will send emails to {guestsWithEmail.length} guest(s) with email addresses.
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Custom Message (optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Add a custom message to the invitation. If left empty, a default invitation message will be sent."
                  rows={6}
                />
              </div>

              <div className="guests-list-preview">
                <strong>Recipients ({guestsWithEmail.length}):</strong>
                <ul>
                  {guestsWithEmail.map(guest => (
                    <li key={guest.id}>{guest.name} ({guest.email})</li>
                  ))}
                </ul>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Emails'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default EmailModal

