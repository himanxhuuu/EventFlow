const axios = require('axios');

// This service integrates with location-based APIs to find real venues and vendors
// For production, you can use Google Places API, Foursquare, or similar services

const searchVenues = async (location, query = 'event venue') => {
  // If Google Places API key is provided, use it
  if (process.env.GOOGLE_PLACES_API_KEY) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: `${query} in ${location}`,
          key: process.env.GOOGLE_PLACES_API_KEY,
          type: 'establishment'
        }
      });

      if (response.data.results) {
        return response.data.results.map(place => ({
          name: place.name,
          address: place.formatted_address,
          location: location,
          rating: place.rating || 0,
          price_level: place.price_level || null,
          place_id: place.place_id,
          source: 'google_places',
          // Estimate capacity and price (would need additional API call for details)
          capacity: 200, // Default estimate
          price_per_day: 3000, // Default estimate
          amenities: 'WiFi, Parking'
        }));
      }
    } catch (error) {
      console.error('Google Places API error:', error.message);
    }
  }

  // Fallback: Return mock data based on location
  // In production, you might want to use other APIs or your own database
  return getMockVenuesForLocation(location, query);
};

const searchVendors = async (location, type = null) => {
  // If Google Places API key is provided, use it
  if (process.env.GOOGLE_PLACES_API_KEY) {
    try {
      const vendorQueries = {
        catering: 'catering service',
        decorator: 'event decoration',
        photographer: 'event photographer',
        entertainment: 'event entertainment',
        florist: 'florist'
      };

      const query = type && vendorQueries[type] 
        ? `${vendorQueries[type]} in ${location}`
        : `event services in ${location}`;

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: query,
          key: process.env.GOOGLE_PLACES_API_KEY,
          type: 'establishment'
        }
      });

      if (response.data.results) {
        return response.data.results.map(place => ({
          name: place.name,
          vendor_type: type || 'other',
          location: location,
          contact_phone: place.formatted_phone_number || null,
          rating: place.rating || 0,
          place_id: place.place_id,
          address: place.formatted_address,
          source: 'google_places',
          service_description: `Professional ${type || 'event'} services in ${location}`,
          price_range: '₹500-₹2,000'
        }));
      }
    } catch (error) {
      console.error('Google Places API error:', error.message);
    }
  }

  // Fallback: Return mock data based on location
  return getMockVendorsForLocation(location, type);
};

// Mock data generator for development/testing
const getMockVenuesForLocation = (location, query) => {
  const mockVenues = [
    {
      name: `Grand ${location} Event Center`,
      address: `123 Main Street, ${location}`,
      location: location,
      capacity: 500,
      price_per_day: 5000,
      rating: 4.5,
      amenities: 'WiFi, Parking, Catering Kitchen, AV Equipment',
      source: 'mock'
    },
    {
      name: `${location} Convention Hall`,
      address: `456 Park Avenue, ${location}`,
      location: location,
      capacity: 300,
      price_per_day: 4000,
      rating: 4.3,
      amenities: 'WiFi, Parking, Breakout Rooms',
      source: 'mock'
    },
    {
      name: `Elegant ${location} Ballroom`,
      address: `789 Business District, ${location}`,
      location: location,
      capacity: 200,
      price_per_day: 3500,
      rating: 4.7,
      amenities: 'WiFi, Parking, Garden, Restaurant',
      source: 'mock'
    },
    {
      name: `${location} Garden Pavilion`,
      address: `321 Greenway, ${location}`,
      location: location,
      capacity: 150,
      price_per_day: 3000,
      rating: 4.6,
      amenities: 'Outdoor Space, Garden, Parking',
      source: 'mock'
    }
  ];

  return mockVenues;
};

const getMockVendorsForLocation = (location, type) => {
  const vendorTypes = type ? [type] : ['catering', 'decorator', 'photographer', 'entertainment', 'florist'];
  
  const vendors = [];
  
  vendorTypes.forEach(vendorType => {
    const typeNames = {
      catering: 'Catering',
      decorator: 'Decoration',
      photographer: 'Photography',
      entertainment: 'Entertainment',
      florist: 'Floral'
    };

    vendors.push({
      name: `${location} ${typeNames[vendorType] || 'Services'} Co.`,
      vendor_type: vendorType,
      location: location,
      contact_phone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
      contact_email: `${vendorType}@${location.toLowerCase().replace(/\s+/g, '')}.com`,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      service_description: `Professional ${vendorType} services in ${location}`,
      price_range: '₹500-₹2,000',
      source: 'mock'
    });

    vendors.push({
      name: `Premium ${typeNames[vendorType] || 'Services'} - ${location}`,
      vendor_type: vendorType,
      location: location,
      contact_phone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
      contact_email: `premium${vendorType}@${location.toLowerCase().replace(/\s+/g, '')}.com`,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      service_description: `Premium ${vendorType} services in ${location}`,
      price_range: '₹1,000-₹3,000',
      source: 'mock'
    });
  });

  return vendors;
};

module.exports = {
  searchVenues,
  searchVendors
};

