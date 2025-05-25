import React from 'react';
import PropTypes from 'prop-types';
import './ErrorMessage.css';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div className={`error-message ${className}`}>
      {message}
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

export default ErrorMessage;