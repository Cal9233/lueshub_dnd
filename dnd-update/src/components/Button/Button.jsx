/**
 * Button Component
 * 
 * A versatile, reusable button component that can render as either a button element
 * or an anchor tag. Supports primary and secondary variants with consistent styling.
 * When an href prop is provided, it renders as a link; otherwise, it renders as a button.
 * 
 * @component
 * @example
 * // Button variant
 * <Button variant="primary" onClick={handleClick}>
 *   Click Me
 * </Button>
 * 
 * @example
 * // Link variant
 * <Button href="/dashboard" variant="secondary">
 *   Go to Dashboard
 * </Button>
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  href, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  // Construct CSS classes based on variant and any additional classes
  // 'cta-button' is the base class, 'secondary' class is added for secondary variant
  const buttonClass = `cta-button ${variant === 'secondary' ? 'secondary' : ''} ${className}`.trim();

  // If href is provided, render as an anchor tag for navigation
  if (href) {
    return (
      <a href={href} className={buttonClass} {...props}>
        {children}
      </a>
    );
  }

  // Otherwise, render as a button element for actions
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * PropTypes definition for Button component
 * 
 * @property {ReactNode} children - Content to display inside the button (required)
 * @property {('primary'|'secondary')} [variant='primary'] - Visual style variant of the button
 * @property {string} [href] - If provided, renders button as a link to this URL
 * @property {Function} [onClick] - Click handler function (only used when href is not provided)
 * @property {string} [type='button'] - HTML button type attribute (button, submit, reset)
 * @property {string} [className=''] - Additional CSS classes to apply to the button
 * @property {...any} props - Any additional props are passed through to the underlying element
 */
Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  href: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string
};

export default Button;