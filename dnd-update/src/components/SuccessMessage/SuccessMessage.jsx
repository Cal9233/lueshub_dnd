import React from 'react';
import PropTypes from 'prop-types';
import './SuccessMessage.css';

const SuccessMessage = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div className={`success-message ${className}`}>
      {message}
    </div>
  );
};

SuccessMessage.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

export default SuccessMessage;