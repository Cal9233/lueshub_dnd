import React from 'react';
import PropTypes from 'prop-types';
import Header from '../Headers/Header';
import './PageHeader.css';

const PageHeader = ({ 
  title = 'LuesHub Dungeons & Dragons', 
  subtitle, 
  className = '' 
}) => {
  return (
    <header className={`page-header ${className}`}>
      <div className="header-content">
        <Header as="h1">{title}</Header>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string
};

export default PageHeader;