export const Section = ({ 
  children, 
  className = '', 
  variant = 'grid',
  columns = 'auto-fit',
  minWidth = '300px',
  gap = '30px',
  padding = '80px 20px',
  maxWidth = '1200px',
  ...props 
}) => {
  const gridColumns = columns === 'auto-fit' 
    ? `repeat(auto-fit, minmax(${minWidth}, 1fr))`
    : columns;

  const sectionStyle = variant === 'grid' ? {
    display: 'grid',
    gridTemplateColumns: gridColumns,
    gap: gap,
    padding: padding,
    maxWidth: maxWidth,
    margin: '0 auto',
    position: 'relative',
    zIndex: 2
  } : {};

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