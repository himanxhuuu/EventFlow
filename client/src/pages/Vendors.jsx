import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import VendorModal from '../components/VendorModal'
import './Vendors.css'

function Vendors() {
  const [vendors, setVendors] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [events, setEvents] = useState([])
  const [location, setLocation] = useState('')
  const [searching, setSearching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchVendors()
    fetchEvents()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors')
      setVendors(response.data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events')
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      alert('Please enter a location')
      return
    }

    setSearching(true)
    try {
      const response = await axios.get('/api/vendors/search/location', {
        params: { 
          location: location.trim(),
          type: filter !== 'all' ? filter : null
        }
      })
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error searching vendors:', error)
      alert('Error searching vendors')
    } finally {
      setSearching(false)
    }
  }

  const handleAssignVendor = async (vendorId) => {
    if (!selectedEvent) {
      alert('Please select an event first')
      return
    }

    try {
      await axios.post('/api/vendors/assign', {
        event_id: selectedEvent,
        vendor_id: vendorId,
        status: 'pending'
      })
      alert('Vendor assigned successfully!')
      if (selectedEvent) {
        navigate(`/events/${selectedEvent}`)
      }
    } catch (error) {
      alert('Error assigning vendor: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const handleAddVendor = async (vendorData) => {
    try {
      await axios.post('/api/vendors', vendorData)
      fetchVendors()
      setSearchResults([])
    } catch (error) {
      alert('Error adding vendor: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const displayedVendors = searchResults.length > 0 ? searchResults : vendors
  const filteredVendors = filter === 'all' 
    ? displayedVendors 
    : displayedVendors.filter(v => v.vendor_type === filter)

  const vendorTypes = [...new Set(vendors.map(v => v.vendor_type))]

  if (loading) {
    return <div className="loading">Loading vendors...</div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Vendors</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            + Add Vendor
          </button>
          <div className="vendor-filters">
            <div className="filter-group">
              <label>Select Event (to assign vendor):</label>
              <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                <option value="">Select an event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Filter by type:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Vendors</option>
                {vendorTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="location-search-section">
        <div className="location-search-box">
          <input
            type="text"
            placeholder="Enter location (e.g., New York, Los Angeles)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          <button 
            onClick={handleLocationSearch} 
            className="btn btn-secondary"
            disabled={searching}
          >
            {searching ? 'Searching...' : '🔍 Search Location'}
          </button>
          {searchResults.length > 0 && (
            <button 
              onClick={() => {
                setSearchResults([])
                setLocation('')
              }} 
              className="btn btn-secondary"
            >
              Show All Vendors
            </button>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="alert alert-info">
            Found {searchResults.length} vendor(s) in {location}. Click "Add Vendor" to save them to your list.
          </div>
        )}
      </div>

      {filteredVendors.length === 0 ? (
        <div className="empty-state">
          <h3>No vendors found</h3>
        </div>
      ) : (
        <div className="vendors-grid">
          {filteredVendors.map(vendor => (
            <div key={vendor.id} className="vendor-card">
              <div className="vendor-header">
                <h3>{vendor.name}</h3>
                <span className="badge badge-info">{vendor.vendor_type}</span>
              </div>
              <div className="vendor-rating">
                ⭐ {vendor.rating} / 5.0
              </div>
              <div className="vendor-info">
                {vendor.service_description && (
                  <p className="vendor-description">{vendor.service_description}</p>
                )}
                <div className="vendor-contact">
                  {vendor.contact_email && (
                    <p>📧 {vendor.contact_email}</p>
                  )}
                  {vendor.contact_phone && (
                    <p>📞 {vendor.contact_phone}</p>
                  )}
                </div>
                {vendor.price_range && (
                  <p className="vendor-price">💰 {vendor.price_range.replace(/\$/g, '₹')}</p>
                )}
              </div>
              {vendor.source === 'mock' || vendor.source === 'google_places' ? (
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  {selectedEvent && (
                    <button 
                      onClick={() => handleAssignVendor(vendor.id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Assign to Event
                    </button>
                  )}
                  <button 
                    onClick={() => handleAddVendor({
                      name: vendor.name,
                      vendor_type: vendor.vendor_type,
                      contact_email: vendor.contact_email || null,
                      contact_phone: vendor.contact_phone || null,
                      service_description: vendor.service_description || null,
                      price_range: vendor.price_range || null,
                      rating: vendor.rating || 0
                    })}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Add to List
                  </button>
                </div>
              ) : (
                selectedEvent && (
                  <button 
                    onClick={() => handleAssignVendor(vendor.id)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '15px' }}
                  >
                    Assign to Event
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <VendorModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchVendors()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

export default Vendors

