import Header from "../Headers/Header";
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
              <a href={primaryHref} className="cta-button">{primaryLabel}</a>
            )}
            {secondaryLabel && (
              <a href={secondaryHref} className="cta-button secondary">{secondaryLabel}</a>
            )}
          </div>
        </div>
    </header>
  )
}

export default HeroBanner