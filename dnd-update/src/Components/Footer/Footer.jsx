import './Footer.css';

const Footer = ({
    className,
    children
}) => {
    return (
        <footer className={className}>{children}</footer>
    )
}

Footer.defaultProps = {
    children: "Footer"
};

export default Footer