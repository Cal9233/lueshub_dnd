import React from 'react';
import PropTypes from 'prop-types';
import './EmptyState.css';

const EmptyState = ({ 
  icon = 'fas fa-folder-open',
  message = 'No data available',
  actionText,
  actionHref,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <i className={icon}></i>
      <p>{message}</p>
      {actionText && actionHref && (
        <a href={actionHref} className="empty-state-action">
          {actionText}
        </a>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  message: PropTypes.string,
  actionText: PropTypes.string,
  actionHref: PropTypes.string,
  className: PropTypes.string
};

export default EmptyState;