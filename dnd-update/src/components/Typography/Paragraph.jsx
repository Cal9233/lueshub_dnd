import React from 'react';
import PropTypes from 'prop-types';

const Paragraph = ({ children, className = '' }) => {
  return <p className={className}>{children}</p>;
};

Paragraph.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Paragraph;