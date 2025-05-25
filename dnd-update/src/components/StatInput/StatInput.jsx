import React from 'react';
import PropTypes from 'prop-types';
import './StatInput.css';

const StatInput = ({
  id,
  label,
  value,
  onChange,
  icon,
  type = 'number',
  min,
  max,
  readOnly = false,
  className = ''
}) => {
  return (
    <div className={`stat-input-container ${className}`}>
      {icon && (
        <div className="stat-icon">
          <i className={icon}></i>
        </div>
      )}
      <div className="stat-value">
        {readOnly ? (
          <span id={id}>{value}</span>
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            className="stat-input"
          />
        )}
      </div>
      <label htmlFor={id} className="stat-label">{label}</label>
    </div>
  );
};

StatInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func,
  icon: PropTypes.string,
  type: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  readOnly: PropTypes.bool,
  className: PropTypes.string
};

export default StatInput;