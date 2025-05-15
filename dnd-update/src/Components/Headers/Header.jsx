function selectHeader(key, children){
  switch (key) {
    case key === "h1":
      return <h1>{children}</h1>;
    case key === "h2":
      return <h2>{children}</h2>;
    case key === "h3":
      return <h3>{children}</h3>;
          case key === "h4":
      return <h4>{children}</h4>;
    default:
      break;
  }
}

const Header = ({style, children}) => {
  return (
    <>{selectHeader(style, children)}</>
  )
}

Header.defaultProps = {
  style: "h2",
  children: "Hello World"
}

export default Header