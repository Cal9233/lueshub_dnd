/**
 * ThemeContext.jsx - Theme management context
 * 
 * Provides centralized theme management for the application with multiple
 * color schemes including light, dark, and themed variations.
 * 
 * Features:
 * - Multiple theme support (light, dark, D&D, ocean, forest)
 * - Persistent theme selection via localStorage
 * - Easy theme switching throughout the app
 * - CSS variable updates for seamless styling
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext(null);

/**
 * Custom hook to access theme context
 * @returns {Object} Theme context value with current theme and theme functions
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Define available themes with their properties
export const themes = {
  light: {
    name: 'Light',
    icon: 'fas fa-sun',
    colors: {
      '--bg-primary': '#f8f9fa',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#f1f3f5',
      '--text-primary': '#333333',
      '--text-secondary': '#666666',
      '--text-muted': '#888888',
      '--border-color': '#e9ecef',
      '--primary-color': '#7b2cbf',
      '--primary-dark': '#5a189a',
      '--secondary-color': '#f48c06',
      '--accent-color': '#38b2ac',
      '--danger-color': '#e53e3e',
      '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
      '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
      '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      '--navbar-bg': '#ffffff',
      '--card-bg': '#ffffff',
      '--footer-bg': '#f1f3f5',
    }
  },
  dark: {
    name: 'Dark',
    icon: 'fas fa-moon',
    colors: {
      '--bg-primary': '#1a202c',
      '--bg-secondary': '#2d3748',
      '--bg-tertiary': '#283141',
      '--text-primary': '#f7fafc',
      '--text-secondary': '#e2e8f0',
      '--text-muted': '#a0aec0',
      '--border-color': '#4a5568',
      '--primary-color': '#9f7aea',
      '--primary-dark': '#805ad5',
      '--secondary-color': '#f6ad55',
      '--accent-color': '#4fd1c5',
      '--danger-color': '#fc8181',
      '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
      '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.4)',
      '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.4)',
      '--navbar-bg': '#2d3748',
      '--card-bg': '#2d3748',
      '--footer-bg': '#1a202c',
    }
  },
  dnd: {
    name: 'D&D Classic',
    icon: 'fas fa-dragon',
    colors: {
      '--bg-primary': '#2b1810', // Dark wood brown
      '--bg-secondary': '#3d241a', // Medium wood brown
      '--bg-tertiary': '#4a2f23', // Light wood brown
      '--text-primary': '#f4e4d4', // Parchment white
      '--text-secondary': '#d4c4b4', // Aged paper
      '--text-muted': '#a09080', // Faded ink
      '--border-color': '#5a3f33', // Wood grain
      '--primary-color': '#8b0000', // Dark maroon red
      '--primary-dark': '#660000', // Darker maroon
      '--secondary-color': '#daa520', // Goldenrod (treasure)
      '--accent-color': '#4682b4', // Steel blue (magic)
      '--danger-color': '#dc143c', // Crimson
      '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.4)',
      '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.5)',
      '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.6)',
      '--navbar-bg': '#3d241a',
      '--card-bg': '#3d241a',
      '--footer-bg': '#2b1810',
    }
  },
  ocean: {
    name: 'Ocean Depths',
    icon: 'fas fa-water',
    colors: {
      '--bg-primary': '#0a192f', // Deep ocean blue
      '--bg-secondary': '#172a45', // Navy blue
      '--bg-tertiary': '#1e3a5f', // Medium blue
      '--text-primary': '#ccd6f6', // Light blue-white
      '--text-secondary': '#a8b2d1', // Soft blue-gray
      '--text-muted': '#8892b0', // Muted blue-gray
      '--border-color': '#233554', // Blue border
      '--primary-color': '#0077be', // Deep ocean blue (better contrast)
      '--primary-dark': '#005a8b', // Darker ocean blue
      '--secondary-color': '#f57c00', // Orange coral
      '--accent-color': '#64ffda', // Cyan accent
      '--danger-color': '#ff5252', // Red alert
      '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
      '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.4)',
      '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
      '--navbar-bg': '#172a45',
      '--card-bg': '#172a45',
      '--footer-bg': '#0a192f',
    }
  },
  forest: {
    name: 'Enchanted Forest',
    icon: 'fas fa-tree',
    colors: {
      '--bg-primary': '#1a2f1a', // Deep forest green
      '--bg-secondary': '#2d4a2b', // Forest green
      '--bg-tertiary': '#3a5f37', // Medium green
      '--text-primary': '#e8f5e9', // Light mint
      '--text-secondary': '#c8e6c9', // Soft green
      '--text-muted': '#a5d6a7', // Muted green
      '--border-color': '#4a7c47', // Green border
      '--primary-color': '#66bb6a', // Leaf green
      '--primary-dark': '#4caf50', // Darker green
      '--secondary-color': '#ffb74d', // Autumn orange
      '--accent-color': '#8d6e63', // Tree bark brown
      '--danger-color': '#e57373', // Berry red
      '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.2)',
      '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.3)',
      '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.4)',
      '--navbar-bg': '#2d4a2b',
      '--card-bg': '#2d4a2b',
      '--footer-bg': '#1a2f1a',
    }
  }
};

/**
 * Theme Provider Component
 * 
 * Wraps the application and provides theme context to all children.
 * Manages theme state, persistence, and CSS variable updates.
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('selectedTheme') || 'light'
  );

  // Apply theme CSS variables on mount and theme change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  /**
   * Applies theme CSS variables to the document root
   * @param {string} themeName - Name of the theme to apply
   */
  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;

    // Apply each CSS variable to the document root
    Object.entries(theme.colors).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });

    // Set data-theme attribute for any legacy CSS
    document.documentElement.setAttribute('data-theme', themeName);
  };

  /**
   * Changes the current theme
   * @param {string} themeName - Name of the theme to switch to
   */
  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('selectedTheme', themeName);
    }
  };

  /**
   * Cycles to the next theme in the list
   */
  const cycleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    changeTheme(themeKeys[nextIndex]);
  };

  // Context value
  const value = {
    currentTheme,
    themes,
    changeTheme,
    cycleTheme,
    themeData: themes[currentTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;