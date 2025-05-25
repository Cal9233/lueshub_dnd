import Header from "../Headers/Header";
import Button from "../Button/Button";
import './HeroBanner.css';

const HeroBanner = ({
  title = 'LuesHub Dungeons & Dragons',
  subtitle = 'Embark on epic adventures in magical realms',
  primaryLabel,
  primaryHref = '#',
  secondaryLabel,
  secondaryHref = '#'
}) => {
  return (
    <header className="hero">
        <div className="hero-content">
          <Header as="h1">{title}</Header>
          <p>{subtitle}</p>
          <div className="hero-buttons">
            {primaryLabel && (
              <Button href={primaryHref} variant="primary">
                {primaryLabel}
              </Button>
            )}
            {secondaryLabel && (
              <Button href={secondaryHref} variant="secondary">
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
    </header>
  )
}

export default HeroBanner