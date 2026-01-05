import React, { useState, useEffect } from 'react'
import axios from 'axios'
import VenueModal from '../components/VenueModal'
import './Venues.css'

function Venues() {
  const [venues, setVenues] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [location, setLocation] = useState('')
  const [searching, setSearching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await axios.get('/api/venues')
      setVenues(response.data)
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      alert('Please enter a location')
      return
    }

    setSearching(true)
    try {
      const response = await axios.get('/api/venues/search/location', {
        params: { location: location.trim() }
      })
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error searching venues:', error)
      alert('Error searching venues')
    } finally {
      setSearching(false)
    }
  }

  const handleAddVenue = async (venueData) => {
    try {
      await axios.post('/api/venues', {
        ...venueData,
        location: location || null
      })
      fetchVenues()
      setSearchResults([])
    } catch (error) {
      alert('Error adding venue: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const displayedVenues = searchResults.length > 0 ? searchResults : venues
  const filteredVenues = filter === 'all' 
    ? displayedVenues 
    : displayedVenues.filter(v => v.availability_status === filter)

  if (loading) {
    return <div className="loading">Loading venues...</div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Venues</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            + Add Venue
          </button>
          <div className="filter-group">
            <label>Filter by availability:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Venues</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
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
              Show All Venues
            </button>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="alert alert-info">
            Found {searchResults.length} venue(s) in {location}. Click "Add Venue" to save them to your list.
          </div>
        )}
      </div>

      {filteredVenues.length === 0 ? (
        <div className="empty-state">
          <h3>No venues found</h3>
        </div>
      ) : (
        <div className="venues-grid">
          {filteredVenues.map(venue => (
            <div key={venue.id} className="venue-card">
              <div className="venue-header">
                <h3>{venue.name}</h3>
                <span className={`badge badge-${venue.availability_status === 'available' ? 'success' : 'danger'}`}>
                  {venue.availability_status}
                </span>
              </div>
              <div className="venue-info">
                <p className="venue-address">📍 {venue.address}</p>
                {venue.location && <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>📍 {venue.location}</p>}
                <div className="venue-details">
                  <div className="detail-item">
                    <strong>Capacity:</strong> {venue.capacity} people
                  </div>
                  <div className="detail-item">
                    <strong>Price:</strong> ₹{venue.price_per_day?.toLocaleString('en-IN') || 'N/A'} per day
                  </div>
                </div>
                {venue.amenities && (
                  <div className="venue-amenities">
                    <strong>Amenities:</strong>
                    <p>{venue.amenities}</p>
                  </div>
                )}
                {venue.source && (
                  <div style={{ marginTop: '15px' }}>
                    {venue.source === 'mock' || venue.source === 'google_places' ? (
                      <button 
                        onClick={() => handleAddVenue({
                          name: venue.name,
                          address: venue.address,
                          capacity: venue.capacity || 200,
                          price_per_day: venue.price_per_day || 3000,
                          amenities: venue.amenities || 'WiFi, Parking',
                          availability_status: 'available'
                        })}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        Add to My Venues
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <VenueModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchVenues()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

export default Venues

