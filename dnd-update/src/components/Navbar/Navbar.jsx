/**
 * Navbar Component
 * 
 * Primary navigation component for the D&D application. Provides main navigation links,
 * theme toggling, and user account menu. The navbar is responsive and supports active
 * page highlighting.
 * 
 * @component
 * @example
 * <Navbar 
 *   username="John Doe"
 *   activePage="dashboard"
 *   onThemeToggle={handleThemeToggle}
 *   currentTheme="light"
 * />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSelector from '../ThemeSelector/ThemeSelector';
import './Navbar.css';

const Navbar = ({ 
  username = 'Adventurer',
  activePage = 'dashboard'
}) => {
  // Get logout function from auth context
  const { logout } = useAuth();
  
  // Track user menu dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Define main navigation items with their metadata
  // Each item contains routing information and Font Awesome icon classes
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home', href: '/dashboard' },
    { id: 'characters', label: 'Characters', icon: 'fas fa-user-shield', href: '/characters' },
    { id: 'campaigns', label: 'Campaigns', icon: 'fas fa-book-open', href: '/campaigns' },
    { id: 'dice-roller', label: 'Dice Roller', icon: 'fas fa-dice-d20', href: '/dice-roller' }
  ];

  return (
    <nav className="navbar">
      {/* Logo/Brand section - always links to dashboard */}
      <div className="navbar-logo">
        <a href="/dashboard">
          <h1>LuesHub D&D</h1>
        </a>
      </div>
      
      {/* Main navigation menu - renders navigation items dynamically */}
      <div className="navbar-menu">
        {navItems.map(item => (
          <a 
            key={item.id}
            href={item.href} 
            className={`navbar-item ${activePage === item.id ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
      
      {/* Right-aligned navbar section with theme selector and user menu */}
      <div className="navbar-end">
        {/* Theme selector dropdown - allows choosing from multiple themes */}
        <ThemeSelector />
        
        {/* User menu dropdown - displays username and account options */}
        <div className="user-menu">
          <button 
            className="user-menu-toggle"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            {username}
          </button>
          {/* Conditionally render dropdown menu when open */}
          {isUserMenuOpen && (
            <div className="user-menu-dropdown">
              <a href="/profile">Profile</a>
              <a href="/settings">Settings</a>
              <button onClick={logout} className="logout-button">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * PropTypes definition for Navbar component
 * 
 * @property {string} [username='Adventurer'] - Display name for the logged-in user
 * @property {string} [activePage='dashboard'] - ID of the currently active page for highlighting
 */
Navbar.propTypes = {
  username: PropTypes.string,
  activePage: PropTypes.string
};

export default Navbar;