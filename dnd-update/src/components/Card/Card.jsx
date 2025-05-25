import React from 'react';
import './Card.css'

// Main Card Container
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Icon Component
export const CardIcon = ({ icon, className = '' }) => {
  return (
    <div className={`card-icon ${className}`}>
      {icon}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ title, className = '' }) => {
  return (
    <h2 className={`card-title ${className}`}>
      {title}
    </h2>
  );
};

// Card Content Component
export const CardContent = ({ children, className = '' }) => {
  return (
    <p className={`card-content ${className}`}>
      {children}
    </p>
  );
};

// Compound Card Component (combines all parts)
export const FeatureCard = ({ icon, title, content, className = '' }) => {
  return (
    <Card className={className}>
      <CardIcon icon={icon} />
      <CardHeader title={title} />
      <CardContent>{content}</CardContent>
    </Card>
  );
};
CardContent.defaultProps = {}