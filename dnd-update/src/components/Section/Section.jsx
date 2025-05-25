export const Section = ({ 
  children, 
  className = '', 
  variant = 'grid',
  columns = 'auto-fit',
  minWidth = '300px',
  gap = '30px',
  padding = '80px 20px',
  maxWidth,
  fullWidth = false,
  ...props 
}) => {
  const gridColumns = columns === 'auto-fit' 
    ? `repeat(auto-fit, minmax(${minWidth}, 1fr))`
    : columns;

  let sectionStyle = {
    padding: padding,
    position: 'relative',
    zIndex: 2
  };

  // Only apply maxWidth and margin if not fullWidth
  if (!fullWidth && variant === 'grid') {
    sectionStyle.maxWidth = maxWidth || '1200px';
    sectionStyle.margin = '0 auto';
  }

  if (variant === 'grid') {
    sectionStyle = {
      ...sectionStyle,
      display: 'grid',
      gridTemplateColumns: gridColumns,
      gap: gap
    };
  } else if (variant === 'content') {
    sectionStyle = {
      ...sectionStyle,
      textAlign: 'center'
    };
  }

  return (
    <section 
      className={`section section--${variant} ${className}`} 
      style={sectionStyle}
      {...props}
    >
      {children}
    </section>
  );
};