import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`cta-buttons ${className}`.trim()}>
      {children}
    </div>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default ButtonGroup;