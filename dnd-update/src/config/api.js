/**
 * API Configuration Module
 * 
 * This module centralizes all API-related configuration for the D&D application.
 * It provides:
 * - Centralized endpoint definitions
 * - Consistent fetch configuration
 * - Helper functions for common HTTP operations
 * 
 * Environment Variables:
 * - REACT_APP_API_URL: Override the default API base URL (useful for development)
 * 
 * Usage:
 * import { API_ENDPOINTS, api } from './config/api';
 * const data = await api.get(API_ENDPOINTS.SESSION_CHECK);
 */

// Base URL for all API requests
// Can be overridden via environment variable for different deployments
const API_BASE_URL = process.env.REACT_APP_API_URL || '/dnd-update/api';

/**
 * API Endpoint Definitions
 * 
 * Centralized location for all API endpoints used throughout the application.
 * Endpoints are grouped by feature area for easy navigation.
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: `${API_BASE_URL}/login.php`,              // POST: User login
  REGISTER: `${API_BASE_URL}/register.php`,        // POST: New user registration
  SESSION_CHECK: `${API_BASE_URL}/session_check.php`, // GET: Validate current session
  LOGOUT: `${API_BASE_URL}/logout.php`,            // GET/POST: End user session
  
  // Character management endpoints
  CHARACTERS: `${API_BASE_URL}/characters.php`,    // GET: List all characters, POST: Create new
  CHARACTER: (id) => `${API_BASE_URL}/characters.php?id=${id}`, // GET: Single character details
  SAVE_CHARACTER: `${API_BASE_URL}/characters.php`, // POST: Update character data
  SAVE_SPELLS: `${API_BASE_URL}/save_spells.php`,  // POST: Update character spells
  REST: `${API_BASE_URL}/rest.php`,                // POST: Process character rest (short/long)
  
  // Campaign management endpoints
  CAMPAIGNS: `${API_BASE_URL}/campaigns.php`,      // GET: List campaigns, POST: Create/update
  
  // Game mechanics endpoints
  ROLL_DICE: `${API_BASE_URL}/roll.php`,           // POST: Process dice rolls
};

/**
 * Default Fetch Configuration
 * 
 * Standard configuration applied to all API requests.
 * 
 * Key settings:
 * - credentials: 'include' - Ensures session cookies are sent with requests
 * - Content-Type: 'application/json' - All requests send/expect JSON data
 */
export const fetchConfig = {
  credentials: 'include', // Critical: Includes cookies for session management
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API Helper Functions
 * 
 * Provides consistent methods for making API requests with proper
 * error handling and JSON parsing.
 */
export const api = {
  /**
   * Performs a GET request to the specified URL
   * 
   * @async
   * @param {string} url - The URL to fetch from
   * @returns {Promise<any>} Parsed JSON response
   * @throws {Error} If the response status is not ok (2xx)
   */
  get: async (url) => {
    const response = await fetch(url, {
      ...fetchConfig,
      method: 'GET',
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse and return JSON response
    return response.json();
  },
  
  /**
   * Performs a POST request to the specified URL with JSON data
   * 
   * @async
   * @param {string} url - The URL to post to
   * @param {Object} data - Data to send in request body (will be JSON stringified)
   * @returns {Promise<any>} Parsed JSON response
   * @throws {Error} If the response status is not ok (2xx)
   */
  post: async (url, data) => {
    const response = await fetch(url, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify(data),  // Convert data to JSON string
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse and return JSON response
    return response.json();
  },
};

export default api;