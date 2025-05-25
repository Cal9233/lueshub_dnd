import React from 'react';
import PropTypes from 'prop-types';
import FooterLink from './FooterLink';
import './Footer.css';

const Footer = ({
    className = '',
    children,
    links = []
}) => {
    return (
        <footer className={className}>
            {children || (
                <div className="footer-content">
                    <p>&copy; 2025 LuesHub D&D. All rights reserved.</p>
                    {links.length > 0 && (
                        <div className="footer-links">
                            {links.map((link, index) => (
                                <FooterLink key={index} href={link.href}>
                                    {link.label}
                                </FooterLink>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </footer>
    );
};

Footer.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    links: PropTypes.arrayOf(
        PropTypes.shape({
            href: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    )
};

export default Footer;