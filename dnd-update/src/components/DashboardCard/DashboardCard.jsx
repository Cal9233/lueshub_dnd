/**
 * DashboardCard Component
 * 
 * A flexible card component designed for dashboard layouts. Provides a consistent
 * structure with header (including icon and optional action), content area with
 * loading state support, and customizable elevation effects. Supports gradient
 * backgrounds for visual emphasis.
 * 
 * @component
 * @example
 * // Basic usage
 * <DashboardCard 
 *   title="Active Characters"
 *   icon="fas fa-users"
 * >
 *   <p>You have 3 active characters</p>
 * </DashboardCard>
 * 
 * @example
 * // With header action and gradient
 * <DashboardCard 
 *   title="Recent Campaigns"
 *   icon="fas fa-book"
 *   headerAction={{ href: "/campaigns", text: "View All" }}
 *   gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
 *   elevation="raised"
 * >
 *   <CampaignList />
 * </DashboardCard>
 */

import React from 'react';
import PropTypes from 'prop-types';
import './DashboardCard.css';

const DashboardCard = ({
  title,
  icon,
  headerAction,
  children,
  className = '',
  id = '',
  loading = false,
  elevation = 'normal',
  gradient = null
}) => {
  // Apply gradient background if provided, otherwise use default styling
  const cardStyle = gradient ? { background: gradient } : {};

  return (
    <div 
      className={`dashboard-card ${className} dashboard-card--${elevation}`}
      id={id}
      style={cardStyle}
    >
      {/* Card header with icon, title, and optional action link */}
      <div className="card-header">
        <h3>
          <i className={icon}></i> {title}
        </h3>
        {/* Conditionally render header action link if provided */}
        {headerAction && (
          <a href={headerAction.href} className="card-header-action">
            {headerAction.text}
          </a>
        )}
      </div>
      
      {/* Card content area with loading state support */}
      <div className="card-content">
        {loading ? (
          // Show loading spinner when data is being fetched
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        ) : (
          // Render children content when not loading
          children
        )}
      </div>
    </div>
  );
};

/**
 * PropTypes definition for DashboardCard component
 * 
 * @property {string} title - Card header title text (required)
 * @property {string} icon - Font Awesome icon class for the header (required)
 * @property {Object} [headerAction] - Optional action link in the card header
 * @property {string} headerAction.href - URL for the action link
 * @property {string} headerAction.text - Display text for the action link
 * @property {ReactNode} [children] - Content to display in the card body
 * @property {string} [className=''] - Additional CSS classes to apply to the card
 * @property {string} [id=''] - HTML id attribute for the card element
 * @property {boolean} [loading=false] - Whether to show loading spinner instead of content
 * @property {('normal'|'raised'|'floating')} [elevation='normal'] - Visual elevation/shadow level
 * @property {string} [gradient=null] - CSS gradient string for card background
 */
DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  headerAction: PropTypes.shape({
    href: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  }),
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  loading: PropTypes.bool,
  elevation: PropTypes.oneOf(['normal', 'raised', 'floating']),
  gradient: PropTypes.string
};

export default DashboardCard;