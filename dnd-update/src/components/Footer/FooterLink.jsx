import React from 'react';
import PropTypes from 'prop-types';

const FooterLink = ({ href, children }) => {
  return <a href={href}>{children}</a>;
};

FooterLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default FooterLink;