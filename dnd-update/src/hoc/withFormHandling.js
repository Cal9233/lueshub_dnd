/**
 * withFormHandling.js - Higher-Order Component for form state management
 * 
 * This HOC provides reusable form handling logic to any component.
 * It manages form state, input changes, error messages, and form submission.
 * 
 * Features:
 * - Centralized form state management
 * - Input change handling
 * - Error state management
 * - Form submission with callback support
 * - Form reset functionality
 * 
 * Usage:
 * const MyForm = withFormHandling(FormComponent, { username: '', password: '' });
 */

import { useState } from 'react';

/**
 * Higher-Order Component that adds form handling capabilities to a component
 * 
 * @param {React.Component} WrappedComponent - The component to enhance with form handling
 * @param {Object} initialState - Initial form data state (default: {})
 * @returns {React.Component} Enhanced component with form handling props
 */
const withFormHandling = (WrappedComponent, initialState = {}) => {
  const FormHandlingComponent = (props) => {
    // Form data state - stores all form field values
    const [formData, setFormData] = useState(initialState);
    
    // Error message state - displays form validation or submission errors
    const [error, setError] = useState('');

    /**
     * Handles input field changes
     * Updates the form data state with the new value
     * 
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Handles form submission
     * Prevents default form submission and calls the provided callback
     * 
     * @param {Event} e - The form submit event
     * @param {Function} callback - Function to call with form data
     *                              Receives (formData, helpers) where helpers = { setError, reset }
     */
    const handleSubmit = (e, callback) => {
      e.preventDefault();
      if (callback) {
        // Provide form data and helper functions to the callback
        callback(formData, { 
          setError, 
          reset: () => setFormData(initialState) 
        });
      }
    };

    // Render the wrapped component with enhanced props
    return (
      <WrappedComponent
        {...props}
        formData={formData}
        error={error}
        setError={setError}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    );
  };

  // Set display name for debugging
  FormHandlingComponent.displayName = `withFormHandling(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return FormHandlingComponent;
};

export default withFormHandling;