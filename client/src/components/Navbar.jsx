import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Event Manager
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Dashboard</Link>
          <Link to="/events" className="navbar-link">Events</Link>
          <Link to="/venues" className="navbar-link">Venues</Link>
          <Link to="/vendors" className="navbar-link">Vendors</Link>
          <div className="navbar-user">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

