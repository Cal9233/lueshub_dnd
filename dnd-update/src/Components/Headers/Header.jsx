const headingTags = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6'
};

const Header = ({ as = 'h2', children }) => {
  const Tag = headingTags[as] || 'h2';
  return <Tag>{children}</Tag>;
};

Header.defaultProps = {
  as: 'h2',
  children: 'Hello World'
};

export default Header;
