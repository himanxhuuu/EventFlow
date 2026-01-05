import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import TaskModal from '../components/TaskModal'
import GuestModal from '../components/GuestModal'
import EmailModal from '../components/EmailModal'
import './EventDetail.css'

function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [venue, setVenue] = useState(null)
  const [vendors, setVendors] = useState([])
  const [tasks, setTasks] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingGuest, setEditingGuest] = useState(null)

  useEffect(() => {
    fetchEventData()
  }, [id])

  const fetchEventData = async () => {
    try {
      const [eventRes, vendorsRes, tasksRes, guestsRes] = await Promise.all([
        axios.get(`/api/events/${id}`),
        axios.get(`/api/vendors/event/${id}`),
        axios.get(`/api/tasks/event/${id}`),
        axios.get(`/api/guests/event/${id}`)
      ])

      setEvent(eventRes.data)
      
      if (eventRes.data.venue_id) {
        try {
          const venueRes = await axios.get(`/api/venues/${eventRes.data.venue_id}`)
          setVenue(venueRes.data)
        } catch (error) {
          console.error('Error fetching venue:', error)
        }
      }

      setVendors(vendorsRes.data)
      setTasks(tasksRes.data)
      setGuests(guestsRes.data)
    } catch (error) {
      console.error('Error fetching event data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreate = () => {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleTaskEdit = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await axios.delete(`/api/tasks/${taskId}`)
      fetchEventData()
    } catch (error) {
      alert('Error deleting task')
    }
  }

  const handleGuestCreate = () => {
    setEditingGuest(null)
    setShowGuestModal(true)
  }

  const handleGuestEdit = (guest) => {
    setEditingGuest(guest)
    setShowGuestModal(true)
  }

  const handleGuestDelete = async (guestId) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) {
      return
    }

    try {
      await axios.delete(`/api/guests/${guestId}`)
      fetchEventData()
    } catch (error) {
      alert('Error deleting guest')
    }
  }

  const handleAssignVendor = async (vendorId) => {
    try {
      await axios.post('/api/vendors/assign', {
        event_id: id,
        vendor_id: vendorId,
        status: 'pending'
      })
      fetchEventData()
    } catch (error) {
      alert('Error assigning vendor')
    }
  }

  const handleRemoveVendor = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this vendor?')) {
      return
    }

    try {
      await axios.delete(`/api/vendors/assign/${assignmentId}`)
      fetchEventData()
    } catch (error) {
      alert('Error removing vendor')
    }
  }

  if (loading) {
    return <div className="loading">Loading event details...</div>
  }

  if (!event) {
    return <div className="empty-state">Event not found</div>
  }

  return (
    <div className="container">
      <Link to="/events" className="back-link">← Back to Events</Link>
      
      <div className="event-detail-header">
        <div>
          <h1>{event.title}</h1>
          <p className="event-meta">
            <span className="badge badge-info">{event.event_type}</span>
            <span className="badge badge-secondary">{event.status}</span>
          </p>
        </div>
      </div>

      <div className="event-detail-content">
        <div className="event-info-card">
          <h3>Event Information</h3>
          <div className="info-row">
            <strong>Start:</strong>
            <span>{format(new Date(event.start_date), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          <div className="info-row">
            <strong>End:</strong>
            <span>{format(new Date(event.end_date), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          {venue && (
            <>
              <div className="info-row">
                <strong>Venue:</strong>
                <span>{venue.name}</span>
              </div>
              <div className="info-row">
                <strong>Address:</strong>
                <span>{venue.address}</span>
              </div>
              <div className="info-row">
                <strong>Capacity:</strong>
                <span>{venue.capacity} people</span>
              </div>
            </>
          )}
          {event.description && (
            <div className="info-row">
              <strong>Description:</strong>
              <span>{event.description}</span>
            </div>
          )}
        </div>

        <div className="tabs">
          <button 
            className={activeTab === 'overview' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'tasks' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks ({tasks.length})
          </button>
          <button 
            className={activeTab === 'vendors' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('vendors')}
          >
            Vendors ({vendors.length})
          </button>
          <button 
            className={activeTab === 'guests' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('guests')}
          >
            Guests ({guests.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              <div className="card">
                <h3>Tasks Summary</h3>
                <p>Total: {tasks.length}</p>
                <p>Completed: {tasks.filter(t => t.status === 'completed').length}</p>
                <p>Pending: {tasks.filter(t => t.status === 'pending').length}</p>
                <p>In Progress: {tasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
              <div className="card">
                <h3>Guests Summary</h3>
                <p>Total: {guests.length}</p>
                <p>Confirmed: {guests.filter(g => g.rsvp_status === 'confirmed').length}</p>
                <p>Pending: {guests.filter(g => g.rsvp_status === 'pending').length}</p>
                <p>Declined: {guests.filter(g => g.rsvp_status === 'declined').length}</p>
              </div>
              <div className="card">
                <h3>Vendors</h3>
                <p>Assigned: {vendors.length}</p>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div className="section-header">
                <h2>Tasks</h2>
                <button onClick={handleTaskCreate} className="btn btn-primary">
                  Add Task
                </button>
              </div>
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks yet. Create one to get started!</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {tasks.map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-content">
                        <div className="task-header">
                          <h4>{task.title}</h4>
                          <span className={`badge badge-${getTaskStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        {task.description && <p>{task.description}</p>}
                        <div className="task-meta">
                          {task.assigned_to && <span>Assigned to: {task.assigned_to}</span>}
                          {task.due_date && (
                            <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                          )}
                          <span className={`priority priority-${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button onClick={() => handleTaskEdit(task)} className="btn btn-secondary">
                          Edit
                        </button>
                        <button onClick={() => handleTaskDelete(task.id)} className="btn btn-danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vendors' && (
            <div>
              <div className="section-header">
                <h2>Vendors</h2>
                <Link to="/vendors" className="btn btn-primary">
                  Browse Vendors
                </Link>
              </div>
              {vendors.length === 0 ? (
                <div className="empty-state">
                  <p>No vendors assigned yet. Browse vendors to add them to your event!</p>
                </div>
              ) : (
                <div className="vendors-list">
                  {vendors.map(vendor => (
                    <div key={vendor.assignment_id} className="vendor-item">
                      <div className="vendor-content">
                        <h4>{vendor.name}</h4>
                        <p className="vendor-type">{vendor.vendor_type}</p>
                        <p>{vendor.service_description}</p>
                        <div className="vendor-meta">
                          <span>Rating: {vendor.rating} ⭐</span>
                          <span>{vendor.price_range?.replace(/\$/g, '₹') || 'N/A'}</span>
                          <span className={`badge badge-${vendor.assignment_status === 'confirmed' ? 'success' : 'warning'}`}>
                            {vendor.assignment_status}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveVendor(vendor.assignment_id)}
                        className="btn btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guests' && (
            <div>
              <div className="section-header">
                <h2>Guests</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {guests.filter(g => g.email && g.email.trim()).length > 0 && (
                    <button onClick={() => setShowEmailModal(true)} className="btn btn-secondary">
                      📧 Send Emails
                    </button>
                  )}
                  <button onClick={handleGuestCreate} className="btn btn-primary">
                    Add Guest
                  </button>
                </div>
              </div>
              {guests.length === 0 ? (
                <div className="empty-state">
                  <p>No guests added yet. Add guests to manage your guest list!</p>
                </div>
              ) : (
                <div className="guests-list">
                  {guests.map(guest => (
                    <div key={guest.id} className="guest-item">
                      <div className="guest-content">
                        <h4>{guest.name}</h4>
                        {guest.email && <p>Email: {guest.email}</p>}
                        {guest.phone && <p>Phone: {guest.phone}</p>}
                        {guest.dietary_restrictions && (
                          <p>Dietary: {guest.dietary_restrictions}</p>
                        )}
                        <span className={`badge badge-${getRSVPColor(guest.rsvp_status)}`}>
                          {guest.rsvp_status}
                        </span>
                      </div>
                      <div className="guest-actions">
                        <button onClick={() => handleGuestEdit(guest)} className="btn btn-secondary">
                          Edit
                        </button>
                        <button onClick={() => handleGuestDelete(guest.id)} className="btn btn-danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          eventId={id}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
            fetchEventData()
          }}
        />
      )}

      {showGuestModal && (
        <GuestModal
          guest={editingGuest}
          eventId={id}
          onClose={() => {
            setShowGuestModal(false)
            setEditingGuest(null)
            fetchEventData()
          }}
        />
      )}

      {showEmailModal && event && (
        <EmailModal
          event={event}
          guests={guests}
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => fetchEventData()}
        />
      )}
    </div>
  )
}

function getTaskStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'info'
    case 'pending':
      return 'warning'
    default:
      return 'secondary'
  }
}

function getRSVPColor(status) {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'declined':
      return 'danger'
    default:
      return 'secondary'
  }
}

export default EventDetail

