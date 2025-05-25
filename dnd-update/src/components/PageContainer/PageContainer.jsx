import React from 'react';
import PropTypes from 'prop-types';
import './PageContainer.css';

const PageContainer = ({ 
  children, 
  className = '',
  maxWidth = '1200px'
}) => {
  const style = {
    maxWidth: maxWidth
  };

  return (
    <div className={`page-container ${className}`} style={style}>
      {children}
    </div>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxWidth: PropTypes.string
};

export default PageContainer;