/**
 * Authentication Context Provider
 * 
 * This module manages the global authentication state for the D&D application.
 * It provides authentication functions (login, register, logout) and maintains
 * the current user's session state across the entire application.
 * 
 * Features:
 * - Session persistence across page refreshes
 * - Automatic session validation on mount
 * - Centralized error handling for auth operations
 * - Protected route support via isAuthenticated flag
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_ENDPOINTS, api } from '../config/api';

// Create the authentication context with null default value
const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context
 * 
 * @returns {Object} Authentication context value containing:
 *   - user: Current user object with id, username, role, and logged_in status
 *   - loading: Boolean indicating if session check is in progress
 *   - error: Current error message (if any)
 *   - login: Function to authenticate user
 *   - register: Function to create new user account
 *   - logout: Function to end user session
 *   - checkSession: Function to validate current session
 *   - isAuthenticated: Boolean for quick auth status checks
 * 
 * @throws {Error} If used outside of AuthProvider component tree
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state and methods
 * to all child components. Should be placed near the root of the
 * component tree, typically in App.jsx.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export const AuthProvider = ({ children }) => {
  // User state: null when not authenticated, object with user data when authenticated
  const [user, setUser] = useState(null);
  
  // Loading state: true during initial session check, false afterwards
  const [loading, setLoading] = useState(true);
  
  // Error state: stores authentication error messages for display
  const [error, setError] = useState(null);

  // Check for existing session when component mounts
  // This ensures users remain logged in across page refreshes
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Validates the current session with the server
   * 
   * Makes an API call to check if the user has a valid session cookie.
   * Updates the user state based on the server response.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const checkSession = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.SESSION_CHECK);
      
      if (data.logged_in) {
        // Session is valid - populate user state with server data
        setUser({
          id: data.user_id,
          username: data.username,
          role: data.role,         // 'player' or 'dm' - used for role-based features
          logged_in: true
        });
      } else {
        // No valid session - ensure user state is cleared
        setUser(null);
      }
    } catch (err) {
      // Network or server error - treat as not authenticated
      console.error('Session check failed:', err);
      setUser(null);
    } finally {
      // Always set loading to false after check completes
      setLoading(false);
    }
  };

  /**
   * Authenticates a user with username and password
   * 
   * @async
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} Result object with:
   *   - success: Boolean indicating if login succeeded
   *   - message: Error message (only present if success is false)
   */
  const login = async (username, password) => {
    // Clear any previous error messages
    setError(null);
    
    try {
      const data = await api.post(API_ENDPOINTS.LOGIN, { username, password });
      
      if (data.success) {
        // Login successful - update user state with server data
        setUser({
          id: data.user_id,
          username: data.username,
          role: data.role,
          logged_in: true
        });
        return { success: true };
      } else {
        // Login failed - store error for display
        setError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      // Network or server error - provide user-friendly message
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Creates a new user account and automatically logs them in
   * 
   * @async
   * @param {string} username - Desired username
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Result object with:
   *   - success: Boolean indicating if registration succeeded
   *   - message: Error message (only present if success is false)
   * 
   * Note: The API expects confirm_password field, which we automatically
   * set to match the password. Frontend validation should ensure passwords
   * match before calling this function.
   */
  const register = async (username, email, password) => {
    // Clear any previous error messages
    setError(null);
    
    try {
      const data = await api.post(API_ENDPOINTS.REGISTER, { 
        username, 
        email, 
        password,
        confirm_password: password  // API requirement - matches password
      });
      
      if (data.success) {
        // Registration successful - auto-login the new user
        // New users always start with 'player' role
        setUser({
          id: data.user_id,
          username: username,
          role: 'player',
          logged_in: true
        });
        return { success: true };
      } else {
        // Registration failed - store error for display
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      // Network or server error - provide user-friendly message
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Logs out the current user
   * 
   * Calls the logout endpoint to clear server session, clears local
   * user state, and redirects to login page. If the API call fails,
   * still clears local state and redirects to ensure a clean logout.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session
      // Using fetch directly here to ensure credentials are included
      await fetch(API_ENDPOINTS.LOGOUT, { credentials: 'include' });
      
      // Clear local user state
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      
      // Even if server logout fails, ensure local cleanup happens
      // This prevents users from being stuck in a logged-in state
      setUser(null);
      window.location.href = '/login';
    }
  };

  // Context value object containing all auth state and methods
  const value = {
    user,              // Current user object or null
    loading,           // True during initial session check
    error,             // Current error message or null
    login,             // Function to authenticate user
    register,          // Function to create new account
    logout,            // Function to end session
    checkSession,      // Function to revalidate session
    isAuthenticated: !!user?.logged_in  // Convenient boolean for auth checks
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;