/**
 * ProtectedRoute Component
 * 
 * A higher-order component that protects routes from unauthorized access.
 * Wraps around components that require authentication, redirecting to login
 * if the user is not authenticated. Shows a loading state while authentication
 * status is being determined.
 * 
 * @component
 * @example
 * // Protecting a route
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // In React Router
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */

import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while authentication status is being determined
  // This prevents flash of content or premature redirects
  if (loading) {
    // TODO: Replace with proper loading component/spinner
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login page if user is not authenticated
  // 'replace' prop replaces current entry in history stack
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

/**
 * PropTypes definition for ProtectedRoute component
 * 
 * @property {ReactNode} children - The component(s) to render if user is authenticated
 */
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;